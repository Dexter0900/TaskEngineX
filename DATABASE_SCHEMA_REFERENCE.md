// DATABASE SCHEMA REFERENCE
// =========================

## Workspace Collection

```javascript
{
  _id: ObjectId,
  name: String (required, max 100),
  description: String (max 500),
  creator: ObjectId (ref: User, required),
  members: [
    {
      userId: ObjectId (ref: User, required),
      role: "admin" | "assigner" | "worker" (required),
      joinedAt: Date (auto)
    }
  ],
  createdAt: Date (auto),
  updatedAt: Date (auto)
}

Indexes:
- creator: 1
- members.userId: 1
```

Example:

```json
{
  "_id": ObjectId("650a1b2c3d4e5f6g7h8i9j"),
  "name": "Acme Corporation",
  "description": "Main workspace for Acme Corp",
  "creator": ObjectId("user001"),
  "members": [
    {
      "userId": ObjectId("user001"),
      "role": "admin",
      "joinedAt": ISODate("2024-01-20T10:00:00Z")
    },
    {
      "userId": ObjectId("user002"),
      "role": "assigner",
      "joinedAt": ISODate("2024-01-21T14:30:00Z")
    },
    {
      "userId": ObjectId("user003"),
      "role": "worker",
      "joinedAt": ISODate("2024-01-22T09:15:00Z")
    }
  ],
  "createdAt": ISODate("2024-01-20T10:00:00Z"),
  "updatedAt": ISODate("2024-01-23T11:20:00Z")
}
```

---

## Project Collection

```javascript
{
  _id: ObjectId,
  workspaceId: ObjectId (ref: Workspace, required),
  name: String (required, max 100),
  description: String (max 500),
  status: "active" | "archived" (default: "active"),
  assigners: [
    {
      userId: ObjectId (ref: User, required),
      role: "assigner" (string)
    }
  ],
  workers: [
    {
      userId: ObjectId (ref: User, required),
      role: "worker" (string)
    }
  ],
  createdBy: ObjectId (ref: User, required),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}

Indexes:
- workspaceId: 1, status: 1
- assigners.userId: 1
- workers.userId: 1
```

Example:

```json
{
  "_id": ObjectId("proj001abc123"),
  "workspaceId": ObjectId("650a1b2c3d4e5f6g7h8i9j"),
  "name": "Website Redesign 2024",
  "description": "Complete redesign of company website",
  "status": "active",
  "assigners": [
    {
      "userId": ObjectId("user002"),
      "role": "assigner"
    }
  ],
  "workers": [
    {
      "userId": ObjectId("user003"),
      "role": "worker"
    },
    {
      "userId": ObjectId("user004"),
      "role": "worker"
    }
  ],
  "createdBy": ObjectId("user002"),
  "createdAt": ISODate("2024-01-21T14:30:00Z"),
  "updatedAt": ISODate("2024-01-23T11:20:00Z")
}
```

---

## Task Collection (Extended)

```javascript
{
  // Original fields (for personal tasks)
  _id: ObjectId,
  title: String (required, max 200),
  description: String (max 1000),
  status: "pending" | "in-progress" | "completed" (default: "pending"),
  priority: "low" | "medium" | "high" (default: "medium"),
  dueDate: Date,
  userId: ObjectId (ref: User, required),
  tags: [String],
  createdAt: Date (auto),
  updatedAt: Date (auto),

  // New workspace fields (null for personal tasks)
  workspaceId: ObjectId | null (ref: Workspace, default: null),
  projectId: ObjectId | null (ref: Project, default: null),

  // Assignment fields (workspace tasks only)
  assignedTo: ObjectId | null (ref: User, default: null),
  assignedBy: ObjectId | null (ref: User, default: null),

  // Approval workflow
  approvalStatus: "pending-approval" | "approved" | "rejected" | null (default: null),
  completedAt: Date | null (default: null)
}

Indexes:
- userId: 1, createdAt: -1 (personal tasks)
- workspaceId: 1, projectId: 1, status: 1 (workspace tasks)
- assignedTo: 1, approvalStatus: 1 (assigned tasks)
- assignedBy: 1 (assigner's tasks)
```

Personal Task Example:

```json
{
  "_id": ObjectId("task001personal"),
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "status": "pending",
  "priority": "low",
  "dueDate": ISODate("2024-01-25T00:00:00Z"),
  "userId": ObjectId("user001"),
  "tags": ["shopping"],
  "workspaceId": null,
  "projectId": null,
  "assignedTo": null,
  "assignedBy": null,
  "approvalStatus": null,
  "completedAt": null,
  "createdAt": ISODate("2024-01-23T10:00:00Z"),
  "updatedAt": ISODate("2024-01-23T10:00:00Z")
}
```

Workspace Task Example:

```json
{
  "_id": ObjectId("task001workspace"),
  "title": "Design homepage",
  "description": "Create Figma mockup for homepage redesign",
  "status": "completed",
  "priority": "high",
  "dueDate": ISODate("2024-02-01T00:00:00Z"),
  "userId": ObjectId("user002"),
  "tags": ["design", "frontend"],
  "workspaceId": ObjectId("650a1b2c3d4e5f6g7h8i9j"),
  "projectId": ObjectId("proj001abc123"),
  "assignedTo": ObjectId("user003"),
  "assignedBy": ObjectId("user002"),
  "approvalStatus": "approved",
  "completedAt": ISODate("2024-01-23T15:30:00Z"),
  "createdAt": ISODate("2024-01-22T09:00:00Z"),
  "updatedAt": ISODate("2024-01-23T16:00:00Z")
}
```

---

## Subtask Collection (Extended)

```javascript
{
  _id: ObjectId,
  taskId: ObjectId (ref: Task, required),
  title: String (required),
  completed: Boolean (default: false),
  workspaceId: ObjectId | null (ref: Workspace, inherited from task),
  projectId: ObjectId | null (ref: Project, inherited from task),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}

Indexes:
- taskId: 1, createdAt: -1
- workspaceId: 1
- projectId: 1
```

Example:

```json
{
  "_id": ObjectId("subtask001"),
  "taskId": ObjectId("task001workspace"),
  "title": "Create wireframe",
  "completed": true,
  "workspaceId": ObjectId("650a1b2c3d4e5f6g7h8i9j"),
  "projectId": ObjectId("proj001abc123"),
  "createdAt": ISODate("2024-01-22T09:15:00Z"),
  "updatedAt": ISODate("2024-01-23T14:00:00Z")
}
```

---

## Task Status Transitions (Workspace Tasks)

```
INITIAL STATE (Assigner creates):
- status: pending
- approvalStatus: null

WORKER PROGRESS:
pending → in-progress → completed (worker marks)

APPROVAL WORKFLOW:
completed → pending-approval (awaits assigner)
  ├─ assigner approves → approved ✅ (FINAL)
  └─ assigner rejects → rejected ❌
                        + status resets to pending
                        + worker can re-do task
                        + re-submits: completed → pending-approval
```

---

## Query Examples

### Get All Workspaces for User

```javascript
db.workspaces.find({ "members.userId": ObjectId("user001") });
```

### Get All Projects in Workspace

```javascript
db.projects.find({ workspaceId: ObjectId("workspace001") });
```

### Get Tasks Assigned to Worker

```javascript
db.tasks.find({
  assignedTo: ObjectId("user003"),
  approvalStatus: { $ne: "approved" },
});
```

### Get Tasks Awaiting Approval from Assigner

```javascript
db.tasks.find({
  assignedBy: ObjectId("user002"),
  approvalStatus: "pending-approval",
});
```

### Get Workspace Task Statistics

```javascript
db.tasks.aggregate([
  {
    $match: {
      workspaceId: ObjectId("workspace001"),
    },
  },
  {
    $group: {
      _id: null,
      total: { $sum: 1 },
      pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
      inProgress: {
        $sum: { $cond: [{ $eq: ["$status", "in-progress"] }, 1, 0] },
      },
      completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
      pendingApproval: {
        $sum: {
          $cond: [{ $eq: ["$approvalStatus", "pending-approval"] }, 1, 0],
        },
      },
      approved: {
        $sum: { $cond: [{ $eq: ["$approvalStatus", "approved"] }, 1, 0] },
      },
      rejected: {
        $sum: { $cond: [{ $eq: ["$approvalStatus", "rejected"] }, 1, 0] },
      },
    },
  },
]);
```

### Get Worker's Task Stats (Role-Based)

```javascript
db.tasks.aggregate([
  {
    $match: {
      workspaceId: ObjectId("workspace001"),
      assignedTo: ObjectId("user003"), // Only their tasks
    },
  },
  {
    $group: {
      _id: null,
      total: { $sum: 1 },
      pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
      completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
    },
  },
]);
```

### Find Subtasks for Task

```javascript
db.subtasks.find({ taskId: ObjectId("task001") });
```

### Check if User is in Workspace

```javascript
db.workspaces.findOne({
  _id: ObjectId("workspace001"),
  "members.userId": ObjectId("user003"),
});
```

---

## Data Integrity Rules

1. **Workspace Creator**: Automatically becomes admin, cannot be removed
2. **Task Ownership**: Created by assigner, userId = assigner
3. **Task Assignment**: Can only assign to project workers
4. **Approval Only**: Only assignedBy assigner can approve/reject
5. **Personal Tasks**: workspaceId = null are completely independent
6. **Status Flow**:
   - Personal: pending ↔ in-progress ↔ completed (any order)
   - Workspace: pending → in-progress → completed → pending-approval → approved/rejected
7. **Cascading**: Deleting task should delete subtasks
8. **Member Limits**: Each user can have multiple roles across different workspaces

---

## Migration Notes (if upgrading from old system)

Old tasks don't need migration - they remain personal by default:

```javascript
// All existing tasks automatically have:
workspaceId: null;
projectId: null;
assignedTo: null;
assignedBy: null;
approvalStatus: null;
completedAt: null;
```

---

## Field Validation

| Field                 | Type   | Required | Min | Max  | Pattern                              |
| --------------------- | ------ | -------- | --- | ---- | ------------------------------------ |
| Workspace.name        | String | Yes      | 1   | 100  | -                                    |
| Workspace.description | String | No       | -   | 500  | -                                    |
| Project.name          | String | Yes      | 1   | 100  | -                                    |
| Project.description   | String | No       | -   | 500  | -                                    |
| Task.title            | String | Yes      | 1   | 200  | -                                    |
| Task.description      | String | No       | -   | 1000 | -                                    |
| Task.priority         | Enum   | No       | -   | -    | low\|medium\|high                    |
| Task.status           | Enum   | Yes      | -   | -    | pending\|in-progress\|completed      |
| Task.approvalStatus   | Enum   | No       | -   | -    | pending-approval\|approved\|rejected |
| Subtask.title         | String | Yes      | 1   | -    | -                                    |
| User.role             | Enum   | Yes      | -   | -    | admin\|assigner\|worker              |

---

Perfect reference for backend developers! 🎯
