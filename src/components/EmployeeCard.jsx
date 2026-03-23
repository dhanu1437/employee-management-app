import React from "react";

function EmployeeCard({ emp, onDelete, onEdit }) {
  return (
    <div className="employee-card">
      <p>
        {emp.name} - {emp.role} - ₹{emp.salary}
      </p>
      <div>
        <button onClick={() => onDelete(emp.id)}>Delete</button>
        <button onClick={() => onEdit(emp)}>Edit</button>
      </div>
    </div>
  );
}

export default React.memo(EmployeeCard);