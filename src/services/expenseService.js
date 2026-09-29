const { Expense } = require('../models/Expense');

// The only fields a client may ever write. Everything else (status,
// submittedBy, reviewedBy, reviewedAt, rejectionReason, _id) is either
// owned by the server or the approval workflow, so mass assignment is
// impossible by construction.
const EDITABLE_FIELDS = [
  'title',
  'amount',
  'category',
  'expenseDate',
  'description',
  'receiptDetails',
];

// Names shown to whoever is looking at the expense (employee or manager).
const POPULATE = 'name email role';

function pickEditable(body) {
  const data = {};
  for (const field of EDITABLE_FIELDS) {
    if (body[field] !== undefined && body[field] !== null) {
      data[field] = body[field];
    }
  }
  return data;
}

function notFound() {
  return { ok: false, status: 404, message: 'Expense not found', data: null };
}

function alreadyProcessed(status) {
  return { ok: false, status: 409, message: `Expense has already been ${status}`, data: null };
}

// Employees only (enforced by requireRole('employee') in the route).
// The owner comes from the JWT; status always starts as 'pending'.
async function createExpense({ body, user }) {
  const expense = await Expense.create({
    ...pickEditable(body),
    submittedBy: user.id,
    status: 'pending',
  });

  return { ok: true, status: 201, message: 'Expense created successfully', data: { expense } };
}

// Employees get their own expenses; managers get every expense they review.
// Supports ?status=, ?page=, ?limit= and sorts newest first.
async function listExpenses({ user, query }) {
  const page = Math.max(1, Math.floor(Number(query.page) || 1));
  const limit = Math.min(100, Math.max(1, Math.floor(Number(query.limit) || 10)));

  const filter = {};
  if (user.role !== 'manager') {
    filter.submittedBy = user.id;
  }
  if (query.status) {
    filter.status = query.status;
  }

  const [expenses, total] = await Promise.all([
    Expense.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('submittedBy', POPULATE)
      .populate('reviewedBy', POPULATE),
    Expense.countDocuments(filter),
  ]);

  return {
    ok: true,
    status: 200,
    message: 'Expenses fetched successfully',
    data: {
      expenses,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    },
  };
}

// Employees may only read their own expenses (others return 404 so the API
// never confirms that a foreign expense exists); managers may read any.
async function getExpense({ id, user }) {
  const expense = await Expense.findById(id)
    .populate('submittedBy', POPULATE)
    .populate('reviewedBy', POPULATE);
  if (!expense) return notFound();

  const owner = String(expense.submittedBy?._id ?? expense.submittedBy);
  if (user.role !== 'manager' && owner !== user.id) return notFound();

  return { ok: true, status: 200, message: 'Expense fetched successfully', data: { expense } };
}

// Employees edit their own pending expenses only. Protected fields are never
// read from the body, so a client cannot approve its own expense this way.
async function updateExpense({ id, body, user }) {
  const expense = await Expense.findById(id);
  if (!expense) return notFound();

  if (String(expense.submittedBy) !== user.id) return notFound();
  if (expense.status !== 'pending') return alreadyProcessed(expense.status);

  expense.set(pickEditable(body));
  await expense.save(); // runs schema validators

  return { ok: true, status: 200, message: 'Expense updated successfully', data: { expense } };
}

// Employees delete their own pending expenses only; finalized work is kept
// as the audit trail of the approval decision.
async function deleteExpense({ id, user }) {
  const expense = await Expense.findById(id);
  if (!expense) return notFound();

  if (String(expense.submittedBy) !== user.id) return notFound();
  if (expense.status !== 'pending') return alreadyProcessed(expense.status);

  await expense.deleteOne();

  return { ok: true, status: 200, message: 'Expense deleted successfully', data: null };
}

module.exports = {
  createExpense,
  listExpenses,
  getExpense,
  updateExpense,
  deleteExpense,
};
