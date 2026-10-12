import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API = "http://localhost:8080/api/tickets";
const STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH"];

const emptyForm = { title: "", description: "", category: "Technical Support", priority: "MEDIUM", status: "OPEN" };

function formatDate(value) {
  if (!value) return "Not available";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function readableStatus(status) { return status?.replaceAll("_", " ") || "OPEN"; }

async function getErrorMessage(response, fallback) {
  try { return (await response.json()).message || fallback; } catch { return fallback; }
}

function App() {
  const [tickets, setTickets] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadTickets() {
    setLoading(true);
    try {
      const response = await fetch(API);
      if (!response.ok) throw new Error(await getErrorMessage(response, `Backend returned HTTP ${response.status}`));
      setTickets(await response.json());
      setError("");
    } catch (requestError) {
      if (requestError instanceof TypeError) {
        setError("Cannot reach the backend at http://localhost:8080. Start it from the nested helpdesk-pro folder, then retry.");
      } else {
        setError(requestError.message || "Could not load tickets.");
      }
    }
    finally { setLoading(false); }
  }

  useEffect(() => { loadTickets(); }, []);

  function updateForm(setter, field, value) { setter((current) => ({ ...current, [field]: value })); }

  async function createTicket(event) {
    event.preventDefault(); setError(""); setSuccess("");
    if (!form.title.trim() || !form.description.trim()) { setError("Title and description are required."); return; }
    try {
      const response = await fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, title: form.title.trim(), description: form.description.trim() }) });
      if (!response.ok) throw new Error(await getErrorMessage(response, "Ticket creation failed"));
      setForm(emptyForm); setSuccess("Ticket created successfully."); await loadTickets();
    } catch (requestError) { setError(requestError.message || "Could not create ticket."); }
  }

  function beginEdit(ticket) {
    setEditingId(ticket.id);
    setEditForm({ title: ticket.title || "", description: ticket.description || "", category: ticket.category || "Technical Support", priority: ticket.priority || "MEDIUM", status: ticket.status || "OPEN" });
    setError(""); setSuccess("");
  }

  async function saveEdit(event, id) {
    event.preventDefault();
    if (!editForm.title.trim() || !editForm.description.trim()) { setError("Title and description are required."); return; }
    setSaving(true); setError("");
    try {
      const response = await fetch(`${API}/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...editForm, title: editForm.title.trim(), description: editForm.description.trim() }) });
      if (!response.ok) throw new Error(await getErrorMessage(response, "Could not update ticket"));
      setEditingId(null); setSuccess("Ticket updated successfully."); await loadTickets();
    } catch (requestError) { setError(requestError.message || "Could not update ticket."); }
    finally { setSaving(false); }
  }

  async function deleteTicket(id) {
    if (!window.confirm("Are you sure you want to delete this ticket?")) return;
    setError(""); setSuccess("");
    try {
      const response = await fetch(`${API}/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error(await getErrorMessage(response, "Delete failed"));
      setSuccess("Ticket deleted successfully."); await loadTickets();
    } catch (requestError) { setError(requestError.message || "Could not delete ticket."); }
  }

  const filteredTickets = useMemo(() => {
    const query = search.trim().toLowerCase();
    return tickets.filter((ticket) => {
      const matchesSearch = !query || `${ticket.title} ${ticket.description}`.toLowerCase().includes(query);
      return matchesSearch && (statusFilter === "ALL" || ticket.status === statusFilter) && (priorityFilter === "ALL" || ticket.priority === priorityFilter);
    });
  }, [tickets, search, statusFilter, priorityFilter]);

  const summary = useMemo(() => ({
    total: tickets.length,
    open: tickets.filter((ticket) => ticket.status === "OPEN").length,
    inProgress: tickets.filter((ticket) => ticket.status === "IN_PROGRESS").length,
    resolved: tickets.filter((ticket) => ticket.status === "RESOLVED").length,
  }), [tickets]);

  return (
    <main className="app-shell">
      <header className="hero"><div><p className="eyebrow">IT SUPPORT MANAGEMENT</p><h1>HelpDesk Pro</h1><p className="hero-text">Create, organize, and resolve support requests from one simple workspace.</p></div><div className="hero-badge">Live ticket dashboard</div></header>
      {error && <div className="feedback feedback-error"><span>{error}</span><button className="feedback-retry" onClick={loadTickets}>Retry connection</button></div>}
      {success && !error && <div className="feedback feedback-success">{success}</div>}

      <section className="summary-grid" aria-label="Ticket summary"><SummaryCard label="Total tickets" value={summary.total} className="summary-total" /><SummaryCard label="Open" value={summary.open} className="summary-open" /><SummaryCard label="In progress" value={summary.inProgress} className="summary-progress" /><SummaryCard label="Resolved" value={summary.resolved} className="summary-resolved" /></section>

      <section className="panel create-panel"><div className="section-heading"><p className="eyebrow">NEW REQUEST</p><h2>Create a Support Ticket</h2></div>
        <form onSubmit={createTicket} className="ticket-form">
          <label>Title<input required maxLength="150" placeholder="Ticket title" value={form.title} onChange={(event) => updateForm(setForm, "title", event.target.value)} /></label>
          <label>Description<textarea required maxLength="2000" placeholder="Describe the issue" value={form.description} onChange={(event) => updateForm(setForm, "description", event.target.value)} /></label>
          <label>Category<input value={form.category} onChange={(event) => updateForm(setForm, "category", event.target.value)} /></label>
          <label>Priority<select value={form.priority} onChange={(event) => updateForm(setForm, "priority", event.target.value)}>{PRIORITIES.map((priority) => <option key={priority}>{priority}</option>)}</select></label>
          <button className="primary-button" type="submit">Create Ticket</button>
        </form>
      </section>

      <section className="panel"><div className="section-heading list-heading"><div><p className="eyebrow">TICKET QUEUE</p><h2>All Tickets <span className="count-pill">{filteredTickets.length}</span></h2></div><button className="secondary-button" onClick={loadTickets} disabled={loading}>↻ Refresh</button></div>
        <div className="filters"><input aria-label="Search tickets" placeholder="Search title or description..." value={search} onChange={(event) => setSearch(event.target.value)} /><select aria-label="Filter by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="ALL">All statuses</option>{STATUSES.map((status) => <option key={status} value={status}>{readableStatus(status)}</option>)}</select><select aria-label="Filter by priority" value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)}><option value="ALL">All priorities</option>{PRIORITIES.map((priority) => <option key={priority} value={priority}>{priority}</option>)}</select></div>
        {loading ? <div className="empty-state"><div className="spinner" />Loading tickets...</div> : filteredTickets.length === 0 ? <div className="empty-state"><strong>{tickets.length === 0 ? "No tickets yet" : "No matching tickets"}</strong><span>{tickets.length === 0 ? "Create your first support ticket above." : "Try changing the search or filters."}</span></div> : <div className="ticket-list">
          {filteredTickets.map((ticket) => <article className="ticket-card" key={ticket.id}>{editingId === ticket.id ? <form onSubmit={(event) => saveEdit(event, ticket.id)} className="edit-form"><div className="ticket-id">Ticket #{ticket.id}</div><label>Title<input required maxLength="150" value={editForm.title} onChange={(event) => updateForm(setEditForm, "title", event.target.value)} /></label><label>Description<textarea required maxLength="2000" value={editForm.description} onChange={(event) => updateForm(setEditForm, "description", event.target.value)} /></label><div className="form-row"><label>Category<input value={editForm.category} onChange={(event) => updateForm(setEditForm, "category", event.target.value)} /></label><label>Priority<select value={editForm.priority} onChange={(event) => updateForm(setEditForm, "priority", event.target.value)}>{PRIORITIES.map((priority) => <option key={priority} value={priority}>{priority}</option>)}</select></label><label>Status<select value={editForm.status} onChange={(event) => updateForm(setEditForm, "status", event.target.value)}>{STATUSES.map((status) => <option key={status} value={status}>{readableStatus(status)}</option>)}</select></label></div><div className="actions"><button className="primary-button" type="submit" disabled={saving}>{saving ? "Saving..." : "Save changes"}</button><button className="secondary-button" type="button" onClick={() => setEditingId(null)}>Cancel</button></div></form> : <><div className="ticket-topline"><span className="ticket-id">Ticket #{ticket.id}</span><span className={`status status-${ticket.status?.toLowerCase()}`}>{readableStatus(ticket.status)}</span></div><h3>{ticket.title}</h3><p className="description">{ticket.description}</p><div className="ticket-details"><span><b>Category</b>{ticket.category || "Uncategorized"}</span><span><b>Priority</b>{ticket.priority || "Not set"}</span><span><b>Created</b>{formatDate(ticket.createdAt)}</span></div><div className="actions"><button className="secondary-button" onClick={() => beginEdit(ticket)}>Edit ticket</button><button className="danger-button" onClick={() => deleteTicket(ticket.id)}>Delete</button></div></>}</article>)}
        </div>}
      </section>
    </main>
  );
}

function SummaryCard({ label, value, className }) { return <div className={`summary-card ${className}`}><span>{label}</span><strong>{value}</strong></div>; }

export default App;
