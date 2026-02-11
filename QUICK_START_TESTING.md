// QUICK START - Testing Workspace RBAC API
// ========================================

## Quick Setup & Testing Flow

### Prerequisites

- Node.js running backend on localhost:5000
- At least 3 test users logged in (or email addresses)
- Postman or similar API client

---

## Step-by-Step Testing

### User Roles Setup

- User A: Will be Workspace Admin
- User B: Will be Assigner
- User C: Will be Worker

---

## 1️⃣ USER A - Create Workspace (Admin)

**Request:**

```
POST http://localhost:5000/api/workspaces
Authorization: Bearer <USER_A_TOKEN>
Content-Type: application/json

{
  "name": "My Company",
  "description": "Main workspace"
}
```

**Response:**

```json
{
  "message": "Workspace created successfully",
  "workspace": {
    "_id": "ws123...",
    "name": "My Company",
    "creator": "userA_id",
    "members": [
      {
        "userId": "userA_id",
        "role": "admin",
        "joinedAt": "2024-01-23T..."
      }
    ]
  }
}
```

Save `workspace_id` for next steps.

---

## 2️⃣ USER A - Add Members (Admin)

### Add User B as Assigner

```
POST http://localhost:5000/api/workspaces/ws123/members
Authorization: Bearer <USER_A_TOKEN>
Content-Type: application/json

{
  "email": "userB@example.com",
  "role": "assigner"
}
```

### Add User C as Worker

```
POST http://localhost:5000/api/workspaces/ws123/members
Authorization: Bearer <USER_A_TOKEN>
Content-Type: application/json

{
  "email": "userC@example.com",
  "role": "worker"
}
```

---

## 3️⃣ USER B - Create Project (Assigner)

```
POST http://localhost:5000/api/workspaces/ws123/projects
Authorization: Bearer <USER_B_TOKEN>
Content-Type: application/json

{
  "name": "Q1 Roadmap",
  "description": "First quarter tasks"
}
```

**Response:**

```json
{
  "message": "Project created successfully",
  "project": {
    "_id": "proj456...",
    "workspaceId": "ws123",
    "name": "Q1 Roadmap",
    "assigners": [
      {
        "userId": "userB_id",
        "role": "assigner"
      }
    ],
    "workers": []
  }
}
```

Save `project_id` for next steps.

---

## 4️⃣ USER A or B - Add Worker to Project

```
POST http://localhost:5000/api/workspaces/ws123/projects/proj456/workers
Authorization: Bearer <USER_A_or_B_TOKEN>
Content-Type: application/json

{
  "email": "userC@example.com"
}
```

---

## 5️⃣ USER B - Create & Assign Task (Assigner)

```
POST http://localhost:5000/api/workspaces/ws123/projects/proj456/tasks
Authorization: Bearer <USER_B_TOKEN>
Content-Type: application/json

{
  "title": "Design homepage",
  "description": "Create homepage mockup in Figma",
  "priority": "high",
  "dueDate": "2024-02-15",
  "tags": ["design", "urgent"],
  "assignedTo": "userC_id"
}
```

**Response:**

```json
{
  "message": "Workspace task created successfully",
  "task": {
    "_id": "task789...",
    "title": "Design homepage",
    "status": "pending",
    "assignedTo": "userC_id",
    "assignedBy": "userB_id",
    "workspaceId": "ws123",
    "projectId": "proj456"
  }
}
```

Save `task_id` for approval workflow.

---

## 6️⃣ USER C - View Assigned Tasks (Worker)

```
GET http://localhost:5000/api/workspaces/ws123/tasks
Authorization: Bearer <USER_C_TOKEN>
```

**Response:** Only shows tasks assigned to User C (role-based filtering)

---

## 7️⃣ USER C - Mark Task Complete (Worker)

```
PATCH http://localhost:5000/api/tasks/task789/mark-complete
Authorization: Bearer <USER_C_TOKEN>
Content-Type: application/json
```

**Response:**

```json
{
  "message": "Task marked as completed, awaiting approval",
  "task": {
    "_id": "task789",
    "status": "completed",
    "approvalStatus": "pending-approval",
    "completedAt": "2024-01-23T14:30:00Z"
  }
}
```

---

## 8️⃣ USER B - Approve Task (Assigner)

### Approve

```
PATCH http://localhost:5000/api/tasks/task789/approval
Authorization: Bearer <USER_B_TOKEN>
Content-Type: application/json

{
  "action": "approve",
  "feedback": "Great work!"
}
```

**Response:**

```json
{
  "message": "Task approved successfully",
  "task": {
    "_id": "task789",
    "approvalStatus": "approved",
    "status": "completed"
  }
}
```

### OR Reject

```
PATCH http://localhost:5000/api/tasks/task789/approval
Authorization: Bearer <USER_B_TOKEN>
Content-Type: application/json

{
  "action": "reject",
  "feedback": "Needs revision"
}
```

**Response:**

```json
{
  "message": "Task rejected successfully",
  "task": {
    "_id": "task789",
    "approvalStatus": "rejected",
    "status": "pending"
  }
}
```

---

## 9️⃣ USER A - View Workspace Stats (Admin)

```
GET http://localhost:5000/api/workspaces/ws123/tasks/stats
Authorization: Bearer <USER_A_TOKEN>
```

**Response (Admin sees all):**

```json
{
  "message": "Workspace task stats fetched successfully",
  "stats": {
    "total": 1,
    "pending": 0,
    "inProgress": 0,
    "completed": 1,
    "pendingApproval": 0,
    "approved": 1,
    "rejected": 0
  }
}
```

---

## 🔟 USER C - View Their Stats (Worker)

```
GET http://localhost:5000/api/workspaces/ws123/tasks/stats
Authorization: Bearer <USER_C_TOKEN>
```

**Response (Worker sees only their tasks):**

```json
{
  "message": "Workspace task stats fetched successfully",
  "stats": {
    "total": 1,
    "pending": 0,
    "inProgress": 0,
    "completed": 1,
    "pendingApproval": 0,
    "approved": 1,
    "rejected": 0
  }
}
```

---

## Error Handling Examples

### Not a Member

```
GET http://localhost:5000/api/workspaces/ws123
Authorization: Bearer <RANDOM_USER_TOKEN>
```

**Response:**

```json
{
  "message": "You are not a member of this workspace"
}
```

Status: 403

---

### Insufficient Permissions

```
POST http://localhost:5000/api/workspaces/ws123/members
Authorization: Bearer <USER_C_TOKEN>  // Worker trying to be admin
Content-Type: application/json

{ "email": "new@user.com", "role": "assigner" }
```

**Response:**

```json
{
  "message": "Admin access required"
}
```

Status: 403

---

### Invalid Role

```
POST http://localhost:5000/api/workspaces/ws123/projects
Authorization: Bearer <USER_C_TOKEN>  // Worker trying to create project
```

**Response:**

```json
{
  "message": "Assigner or Admin access required"
}
```

Status: 403

---

## Personal Tasks Still Work!

Personal tasks (non-workspace) continue to work as before:

```
POST http://localhost:5000/api/tasks
Authorization: Bearer <ANY_USER_TOKEN>
Content-Type: application/json

{
  "title": "Personal task",
  "description": "This is not in any workspace",
  "priority": "medium"
}
```

This creates a task with `workspaceId: null` (personal task).

---

## Common Issues & Fixes

### Issue: "User not found"

**Cause:** Email doesn't exist in system
**Fix:** Make sure user has signed up/logged in first

### Issue: "User is already a member"

**Cause:** Trying to add same user twice
**Fix:** Use different user or check workspace members first

### Issue: "Only assigned worker can mark complete"

**Cause:** Wrong user trying to mark task complete
**Fix:** Use token of user the task is assigned to

### Issue: "Only the assigner can approve"

**Cause:** Wrong user trying to approve
**Fix:** Use token of user who assigned the task

---

## Database View (for testing)

Check created documents in MongoDB:

```javascript
// Workspaces
db.workspaces.find({});

// Projects
db.projects.find({ workspaceId: ObjectId("ws123...") });

// Workspace Tasks
db.tasks.find({ workspaceId: ObjectId("ws123...") });

// Personal Tasks
db.tasks.find({ workspaceId: null });

// Stats by status
db.tasks.aggregate([
  { $match: { workspaceId: ObjectId("ws123...") } },
  {
    $group: {
      _id: "$approvalStatus",
      count: { $sum: 1 },
    },
  },
]);
```

---

## Success Criteria

✅ All 10 steps complete without errors
✅ Personal tasks still created/managed normally
✅ RBAC working (workers can't create/approve)
✅ Approval workflow: pending → pending-approval → approved
✅ Role-based filtering working (workers see only their tasks)
✅ Admin can see all workspace data
✅ Stats reflecting correct counts

---

## Next: Frontend Integration

After testing API works:

1. Create workspace selector component
2. Build project board
3. Add member management UI
4. Create task assignment form
5. Build approval interface

---

Happy Testing! 🚀
