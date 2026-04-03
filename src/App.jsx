import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import Signup from "./components/Signup";
import Login from "./components/Login";
import Logout from "./components/Logout";
import EmployeeCard from "./components/EmployeeCard";
import "./App.css";

export default function App() {
  const [user, setUser] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [salary, setSalary] = useState("");
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");

  // ================= AUTH =================
  useEffect(() => {
    // 🔥 Handles OAuth redirect session (VERY IMPORTANT)
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    // 🔥 Listen for login/logout changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  // ================= SAVE USER =================
  useEffect(() => {
    if (user) {
      saveUser(user);
    }
  }, [user]);

  async function saveUser(user) {
    if (!user) return;

    await supabase.from("users").upsert({
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name || user.email,
    });
  }

  // ================= FETCH EMPLOYEES =================
  useEffect(() => {
    if (user) fetchEmployees();
  }, [user, search]);

  async function fetchEmployees() {
    let query = supabase.from("employees_table").select("*");

    if (search) {
      query = query.or(`name.ilike.%${search}%,role.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (!error) setEmployees(data || []);
  }

  // ================= REALTIME =================
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("employees_table_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "employees_table" },
        (payload) => {
          const { eventType, new: newRow, old: oldRow } = payload;

          if (eventType === "INSERT" && newRow) {
            if (
              !search ||
              newRow.name.toLowerCase().includes(search.toLowerCase()) ||
              newRow.role.toLowerCase().includes(search.toLowerCase())
            ) {
              setEmployees((prev) => [...prev, newRow]);
            }
          }

          if (eventType === "UPDATE" && newRow) {
            setEmployees((prev) =>
              prev.map((emp) => (emp.id === newRow.id ? newRow : emp))
            );
          }

          if (eventType === "DELETE" && oldRow) {
            setEmployees((prev) =>
              prev.filter((emp) => emp.id !== oldRow.id)
            );
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user, search]);

  // ================= ADD =================
  async function addEmployee() {
    if (!name || !role || !salary) {
      return alert("All fields required");
    }

    const { error } = await supabase
      .from("employees_table")
      .insert([{ name, role, salary }]);

    if (!error) {
      setName("");
      setRole("");
      setSalary("");
    }
  }

  // ================= UPDATE =================
  async function updateEmployee() {
    const { data, error } = await supabase
      .from("employees_table")
      .update({ name, role, salary })
      .eq("id", editId)
      .select();

    if (!error && data?.length) {
      setEmployees((prev) =>
        prev.map((emp) => (emp.id === editId ? data[0] : emp))
      );

      setEditId(null);
      setName("");
      setRole("");
      setSalary("");
    }
  }

  // ================= DELETE =================
  async function deleteEmployee(id) {
    const { error } = await supabase
      .from("employees_table")
      .delete()
      .eq("id", id);

    if (!error) {
      setEmployees((prev) => prev.filter((emp) => emp.id !== id));
    }
  }

  // ================= UI =================
  return (
    <div className="container">
      {!user ? (
        <>
          <h1>Welcome</h1>
          <Signup />
          <Login />
        </>
      ) : (
        <>
          <h1>Employee Management</h1>
          <p>{user.email}</p>
          <Logout setUser={setUser} />

          {/* FORM */}
          <div>
            <input
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              placeholder="Role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
            <input
              placeholder="Salary"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
            />
            <input
              className="search"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <button onClick={editId ? updateEmployee : addEmployee}>
              {editId ? "Update" : "Add"}
            </button>
          </div>

          <hr />

          {/* LIST */}
          {employees.length === 0 ? (
            <p>No employees found</p>
          ) : (
            employees.map((emp) => (
              <EmployeeCard
                key={emp.id}
                emp={emp}
                onDelete={deleteEmployee}
                onEdit={(emp) => {
                  setEditId(emp.id);
                  setName(emp.name);
                  setRole(emp.role);
                  setSalary(emp.salary);
                }}
              />
            ))
          )}
        </>
      )}
    </div>
  );
}