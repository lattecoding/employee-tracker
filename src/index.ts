import { pool, connectToDb } from "./connections.js";
import inquirer from "inquirer";

// View all employees
const viewEmployees = async () => {
  const result = await pool.query("SELECT * FROM employee");
  console.table("Employees:", result.rows);
};

// View all roles
const viewRoles = async () => {
  const result = await pool.query("SELECT * FROM role");
  console.table("Roles:", result.rows);
};

// View all departments
const viewDepartments = async () => {
  const result = await pool.query("SELECT * FROM department");
  console.table("Departments:", result.rows);
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
    [first_name, last_name, role_id, manager_id ? manager_id : null],
  );

  console.log(`Employee '${first_name} ${last_name}' added successfully.`);
};

// Update an employee's role
const updateEmployeeRole = async () => {
  const employeesResult = await pool.query("SELECT * FROM employee");
  const employees = employeesResult.rows.map((employee) => ({
    name: `${employee.first_name} ${employee.last_name}`,
    value: employee.id,
  }));

  const rolesResult = await pool.query("SELECT * FROM role");
  const roles = rolesResult.rows.map((role) => ({
    name: role.title,
    value: role.id,
  }));

  const { employee_id, role_id } = await inquirer.prompt([
    {
      name: "employee_id",
      type: "list",
      message: "Select employee to update:",
      choices: employees,
    },
    {
      name: "role_id",
      type: "list",
      message: "Select new role:",
      choices: roles,
    },
  ]);

  await pool.query("UPDATE employee SET role_id = $1 WHERE id = $2", [
    role_id,
    employee_id,
  ]);
  console.log(`Employee's role updated successfully.`);
};

// Add a role
const addRole = async () => {
  const { title, salary } = await inquirer.prompt([
    { name: "title", message: "Enter role title:" },
    { name: "salary", message: "Enter role salary:" },
  ]);

  const departmentsResult = await pool.query("SELECT * FROM department");
  const departments = departmentsResult.rows.map((dept) => ({
    name: dept.name,
    value: dept.id,
  }));

  const { department_id } = await inquirer.prompt([
    {
      name: "department_id",
      type: "list",
      message: "Select department:",
      choices: departments,
    },
  ]);

  await pool.query(
    "INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)",
    [title, salary, department_id],
  );

  console.log(`Role '${title}' added successfully.`);
};

// Add a department
const addDepartment = async () => {
  const { name } = await inquirer.prompt({
    name: "name",
    message: "Enter department name:",
  });

  await pool.query("INSERT INTO department (name) VALUES ($1)", [name]);
  console.log(`Department '${name}' added successfully.`);
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
      "View All Employees",
      "Add Employee",
      "Update Employee Role",
      "View All Roles",
      "Add Role",
      "View All Departments",
      "Add Department",
      "Delete Employee",
      "Exit",
    ],
  });

  switch (action) {
    case "View All Employees":
      await viewEmployees();
      break;
    case "View All Roles":
      await viewRoles();
      break;
    case "View All Departments":
      await viewDepartments();
      break;
    case "Add Employee":
      await addEmployee();
      break;
    case "Update Employee Role":
      await updateEmployeeRole();
      break;
    case "Add Role":
      await addRole();
      break;
    case "Add Department":
      await addDepartment();
      break;
    case "Delete Employee":
      await deleteEmployee();
      break;
    default:
      await pool.end();
      console.log("Exiting...");
      return;
  }

  // Restart the menu after completing an action
  await mainMenu();
};

mainMenu();
