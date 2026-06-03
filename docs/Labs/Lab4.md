# Database Security Measures

## **Objective:**

- Understand  security principles, including authentication, authorization, and access controls.
  
- Create different user roles and assign permissions to database objects.

- Set up role-based access (RBAC) to control who can access specific database objects.

- Apply basic encryption to protect sensitive data stored in the database.

- Simulate SQL injection attacks and explain prevention methods such as prepared statements.


## **Lab Content:**
- Database Security Principles
    1. Authentication
    2. Authorization
- Practical Implementation of Database Security Concepts
    1. Create Database and Tables
    2. Create User Roles and Assign Permissions
    3. Create Roles and Assign to User
    4. Column-Level Encryption 
    5. Simulate SQL Injection & Prevention
- Assignment Instructions
  

---
## Database Security Principles

### 1. Authentication

**Definition:**  
Verifying a user's identity before granting database access.

**Examples:**  
- Username/password login validation  
- Multi-factor authentication (MFA)  

**Purpose:**  
Ensures only verified users can interact with the database system.

---

### 2. Authorization

**Definition:**  
Determines what actions authenticated users are allowed to perform, such as read, write, or modify.

**Examples:**  
- Granting `SELECT` privileges on specific tables
- Restricting `DROP`/`ALTER` commands to DBAs  

**Purpose:**  
Prevents unauthorized data access or modifications.

---

Often, a user must log in to a system using some form of authentication. After authentication, access control mechanisms determine which operations 
the user can or cannot perform by comparing their identity to an access control list (ACL). While authorization policies define what an individual 
or group is allowed to access, access controls are the mechanisms used to enforce these policies."


---

## Practical Implementation of Database Security Concepts

## 1. Create Database and Tables

- Create a DB (`university_db`)
- Create Tables: `students`, `courses`
- Insert data

![Create Database Screenshot](images/Create-DB.png)

---

![Create Database Screenshot](images/insert-data.png)

---

## 2. Create User Roles and Assign Permissions

Create user roles with specific permissions to control access based on each user's responsibilities. For example, allowing actions like 
data viewing `Select` while preventing modifications `Update` and `Insert`. This strengthens security, minimizes errors, and improves operational control.

Here we will create a read-only user named `data_viewer` and grant access to the tables `students` and `courses`.

```sql
-- Create a new user
CREATE USER 'data_viewer'@'localhost' IDENTIFIED BY 'viewerpass123';

-- Grant SELECT permission directly on specific tables
GRANT SELECT ON university_db.students TO 'analyst'@'localhost';
GRANT SELECT ON university_db.courses TO 'analyst'@'localhost';
```

---
## 3. Create Roles and Assign to User

Instead of assigning permissions to each user individually, we create a role (e.g., `readonly`) with specific privileges and assign it to multiple users.  
This is easier to manage, especially for large teams, because roles group privileges into reusable sets.

Here, we’ll create a role named `readonly` and assign it to the `data_viewer` user we created earlier.

```sql
-- Create a read-only role
CREATE ROLE 'readonly';

-- Grant SELECT permissions to the role
GRANT SELECT ON university_db.* TO 'readonly';

-- Assign role to user
GRANT 'readonly' TO 'data_viewer'@'localhost';
```

**Expected Output:**

The user can only view data; they cannot insert, update, or delete.

---
### **Test Instructions**

1. Log in as `data_viewer`.
   
2. Click the **( + )** icon on the welcome screen to **Add a New Connection**.
    ![Create Database Screenshot](images/New-Connection.png)
3. Fill out the connection details and click **Test Connection**.
   ![Create Database Screenshot](images/Test-Connection.png)
4. Once the successful connection message appears, click **OK** to proceed.
   ![Create Database Screenshot](images/successful-connection.png)
5. Run the Following Code in the data viewer editor.
```sql
-- Activate the readonly role
SET ROLE 'readonly';

-- Select the database
USE university_db;

--  This should work (SELECT permission granted)
SELECT * FROM students;

--  This should fail (no INSERT permission for the students table)
INSERT INTO students (name, email) VALUES ('Test User', 'test@example.com');

--  This should fail (no UPDATE permission for the teacher table)
UPDATE teachers SET salary = 90000 WHERE id = 1;
```


---

### Direct Grant vs Role-Based Access Control (RBAC)

Direct Grant refers to assigning permissions directly to individual users on a specific database object (`GRANT SELECT ON students TO 'data_viewer'`).
While this approach works well for small systems, it becomes difficult to manage as the number of users increases, often leading to inconsistent or 
redundant privilege assignments. In contrast, Role-Based Access Control (RBAC) provides a more scalable and organized method by assigning permissions 
to roles rather than to users directly. Users are then granted roles based on their responsibilities. (e.g.,  `GRANT SELECT ON students TO 'readonly';
GRANT 'readonly' TO 'data_viewer';`) This makes it easier to maintain consistent access policies, simplifies permission updates, and aligns with the
principle of least privilege.

---

## 4. Column-Level Encryption 

Column-level encryption is a database security technique used to protect sensitive data stored in specific columns of a table allows you to encrypt sensitive data, 
such as (Social Security Numbers, passwords, or medical records) at the column level within a table. In MySQL, Functions like AES_ENCRYPT() and AES_DECRYPT() are 
commonly used to perform encryption and decryption, ensuring that even if someone gains access to the database, the data remains unreadable without the decryption key

- `AES_ENCRYPT(data, key)` → encrypts data  
- `AES_DECRYPT(data, key)` → decrypts encrypted data  

Encrypted data is stored as binary (e.g., `VARBINARY`), and both encryption & decryption must use the same key.

---

### Example: Encrypting Student SSNs in the previously created `students` table

**1. Insert encrypted data into the students table**
```sql
INSERT INTO students (name, email, ssn)
VALUES (
    'Mazen',
    'mazen@student.edu',
    AES_ENCRYPT('123-45-6789', 'secret_key')
);
```

The `secret_key` is the encryption key used for encrypting sensitive data. You must use the **same key** to decrypt the data later.

**2. Select and Decrypt Data**

The following SQL query selects the `name` and `email` columns and decrypts the `ssn` (social security number) column using the AES encryption key `secret_key`:

```sql
SELECT name, email, AES_DECRYPT(ssn, 'secret_key') AS decrypted_ssn
FROM students;
```
**Note:** If the wrong key is used, `decrypted_ssn` will return `NULL`.


---

## 5. Simulate SQL Injection & Prevention

SQL injection is a common attack where an attacker inserts malicious SQL code into input fields to manipulate queries. This section demonstrates an unsafe query and
how to prevent it using the prepared statements technique.


### Example (Using the admin “Root” editor)

### Simulate SQL Injection (Unsafe Query)

This example will demonstrate how malicious input like `'' OR '1'='1'` can trick a query into returning all rows, even if the condition should match only one row.

**1. Simulate unsafe user input**

```sql
SET @user_input = "' OR '1'='1";
```
**2. Dynamically build an unsafe SQL query**
```sql
SET @query = CONCAT("SELECT * FROM students WHERE name = '", @user_input, "'");
```
**3. Prepare and execute the query**
```sql
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
```

**Effect:** Returns all users due to the injected

  ![Create Database Screenshot](images/SQL-injection.png)

---

### Prevent SQL Injection- Safe Approach (Prepared Statements)

Prepared statements separate SQL code from user input. Instead of embedding user input directly into a SQL query —which can be exploited by attackers— prepared statements use 
placeholders (e.g., ?) for input values. These are known as parameters. An SQL statement template is created and sent to the database with these placeholders, while the actual
data is supplied later. For example: `INSERT INTO MyGuests VALUES (?, ?, ?)` In this query, the values are not directly inserted into the SQL string; instead, they are safely 
passed and bound at execution time. This ensures that user input is treated strictly as data, not executable code. 

The process involves two key steps: preparing the statement and then executing it, and here are the steps to follow.


**Step 1:** Prepare a safe query with a placeholder (Tells MySQL to prepare an SQL query in advance with a placeholder `?` for user input, which guarantees the query structure 
is fixed and cannot be changed by user input.)
```sql
PREPARE stmt FROM 'SELECT * FROM students WHERE name = ?';
```
**Step 2:** Define the user input
```sql
SET @name_input = "Sara";
```

**Step 3:** Execute the statement safely using bound input ( Runs the query and plugs in the value stored in @name_input, which blocks any attempt to inject SQL.)
```sql
EXECUTE stmt USING @name_input;
DEALLOCATE PREPARE stmt;
```

**Expected Result:**  Returns only user ‘Sara’ without risk of injection.

--- 
**Try** modifying the input to include something malicious, like `' OR '1'='1`. You will notice that MySQL treats it as a `string`, not as part of the `SQL logic`.


```sql

PREPARE stmt FROM 'SELECT * FROM students WHERE name = ?';
SET @name_input = "' OR '1'='1"; 
EXECUTE stmt USING @name_input;
EXECUTE stmt USING @name_input;
```

**Expected Result:** No row will return.

  ![Create Database Screenshot](images/Safe-Approach.png)

--- 
# Assignment 4
# What to assign:

### **1. Create users and privilege assignments:**

  - One user with **read-only access** to the entire database. [Direct Grant]
  - One user with **read, insert and Update** permissions, but **no delete**. [Role-Based Access Control: A data-entry role]
  - One user with access to **only specific columns** (e.g., can view names but **not emails or IDs**). [Direct Grant]

- **Screenshot Requirements:**
  - User and Role creation commands and privilege assignment.
  - Evidence of successful and failed attempts to access or modify tables or columns.


### **2. Encrypt a sensitive column (e.g., national ID):**

#### Show how:
  - Data looks when encrypted.
  - Data can be safely decrypted.

#### **Screenshot Requirements:**
   - Encrypted data insertion.
   - Decryption query and its output.
   - View comparing encrypted binary data vs readable decrypted results.


### **3. SQL Injection Methods:**

#### **Report:**
  - Brief explanation (1-2 paragraphs) of what SQL injection is and why preventing it is important.
  - Common prevention methods (Prepared statements, Input sanitization, etc.) 

---

## What to Submit

#### A **PDF document** including:
  - Screenshots for each task, with a caption under each screenshot explaining what it shows.
  - A (1-2 paragraphs) report on SQL injection (as described above).

!!! attention "Due Date on 21/07/2026 11:59 PM"

* <span style="color: red;"> Please review the general lab structure requirements [here](general_instructions.md) </span>

### Submission Instructions

Submit your lab report in **PDF format** via email to **[advanceddb2026@gmail.com](mailto:advanceddb2026@gmail.com)**. 
**Email Subject Format:** `Lab 4 - Student ID`
