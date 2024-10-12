import { pool, connectToDb } from "./connections.js";
import inquirer from "inquirer";

// View all employees
const viewEmployees = async () => {
  const result = await pool.query("SELECT * FROM employee");
  console.log("Employees:", result.rows);
};

// View all roles
const viewRoles = async () => {
  const result = await pool.query("SELECT * FROM role");
  console.log("Roles:", result.rows);
};

// View all departments
const viewDepartments = async () => {
  const result = await pool.query("SELECT * FROM department");
  console.log("Departments:", result.rows);
};

// Add an employee
const addEmployee = async () => {
  const rolesResult = await pool.query("SELECT * FROM role");
  const roles = rolesResult.rows.map((role) => ({
    name: role.title,
    value: role.id,
  }));

  const { first_name, last_name, role_id, manager_id } = await inquirer.prompt([
    { name: "first_name", message: "Enter first name:" },
    { name: "last_name", message: "Enter last name:" },
    { name: "role_id", type: "list", message: "Select role:", choices: roles },
    { name: "manager_id", message: "Enter manager ID (or leave blank):" },
  ]);

  await pool.query(
    "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)",
    [first_name, last_name, role_id, manager_id || null],
  );
  console.log(`Employee '${first_name} ${last_name}' added successfully.`);
};

// Delete an employee
const deleteEmployee = async () => {
  const { id } = await inquirer.prompt({
    name: "id",
    message: "Enter the ID of the employee to delete:",
  });

  await pool.query("DELETE FROM employee WHERE id = $1", [id]);
  console.log(`Employee with ID ${id} deleted successfully.`);
};

const mainMenu = async () => {
  await connectToDb();

  const { action } = await inquirer.prompt({
    name: "action",
    type: "list",
    message: "What would you like to do?",
    choices: [
      "View Employees",
      "View Roles",
      "View Departments",
      "Add Employee",
      "Delete Employee",
      "Exit",
    ],
  });

  if (action === "View Employees") {
    await viewEmployees();
  } else if (action === "View Roles") {
    await viewRoles();
  } else if (action === "View Departments") {
    await viewDepartments();
  } else if (action === "Add Employee") {
    await addEmployee();
  } else if (action === "Delete Employee") {
    await deleteEmployee();
  } else {
    await pool.end();
    console.log("Exiting...");
    return;
  }

  // Restart the menu after completing an action
  await mainMenu();
};

mainMenu();
