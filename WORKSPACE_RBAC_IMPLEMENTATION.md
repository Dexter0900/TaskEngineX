// WORKSPACE RBAC TASK MANAGEMENT - MVP IMPLEMENTATION GUIDE
// =========================================================

## 🎯 Architecture Overview

### Data Models

1. **Workspace** - Container for collaboration
   - Creator (auto-admin)
   - Members array with roles (admin/assigner/worker)

2. **Project** - Sub-container within workspace
   - Assigners (can create/assign tasks)
   - Workers (execute tasks)
   - Status: active/archived

3. **Task** - Enhanced with workspace support
   - Personal tasks: workspaceId=null (existing functionality preserved)
   - Workspace tasks: includes workspaceId, projectId, assignedTo, assignedBy
   - Approval workflow: pending-approval → approved/rejected

4. **Subtask** - Inherits workspace context from parent task

---

## 📋 Role-Based Access Control (RBAC)

### Workspace Level

- **Admin**: Full control (create projects, manage members, assign roles)
- **Assigner**: Can create projects and assign tasks to workers
- **Worker**: Can only view assigned tasks and mark them complete

### Project Level

- **Assigner**: Can assign tasks to project workers
- **Worker**: Can execute tasks (mark complete, await approval)

### Task Workflow

```
WORKFLOW: pending → in-progress → completed (worker marks) → pending-approval (awaits assigner) → approved/rejected
```

---

## 🔗 API Endpoints

### WORKSPACE MANAGEMENT

#### Create Workspace

```
POST /api/workspaces
Body: { name, description? }
Response: { message, workspace }
Auth: Required (user becomes admin)
```

#### Get User's Workspaces

```
GET /api/workspaces
Response: { message, workspaces[] }
Auth: Required
```

#### Get Workspace Details

```
GET /api/workspaces/:workspaceId
Response: { message, workspace }
Auth: Required (member verification)
```

#### Update Workspace (Admin Only)

```
PUT /api/workspaces/:workspaceId
Body: { name?, description? }
Response: { message, workspace }
Auth: Required + Admin role
```

#### Delete Workspace (Admin Only)

```
DELETE /api/workspaces/:workspaceId
Response: { message }
Auth: Required + Admin role
```

#### Add Member to Workspace (Admin Only)

```
POST /api/workspaces/:workspaceId/members
Body: { email, role: "admin"|"assigner"|"worker" }
Response: { message, workspace }
Auth: Required + Admin role
```

#### Update Member Role (Admin Only)

```
PATCH /api/workspaces/:workspaceId/members/:userId/role
Body: { role: "admin"|"assigner"|"worker" }
Response: { message, workspace }
Auth: Required + Admin role
```

#### Remove Member (Admin Only)

```
DELETE /api/workspaces/:workspaceId/members/:userId
Response: { message, workspace }
Auth: Required + Admin role
```

---

### PROJECT MANAGEMENT

#### Create Project (Admin/Assigner Only)

```
POST /api/workspaces/:workspaceId/projects
Body: { name, description? }
Response: { message, project }
Auth: Required + (Admin or Assigner role)
```

#### Get Workspace Projects

```
GET /api/workspaces/:workspaceId/projects
Response: { message, projects[] }
Auth: Required (workspace member)
```

#### Get Project Details

```
GET /api/workspaces/:workspaceId/projects/:projectId
Response: { message, project }
Auth: Required (workspace member)
```

#### Update Project (Admin/Assigner Only)

```
PUT /api/workspaces/:workspaceId/projects/:projectId
Body: { name?, description?, status?: "active"|"archived" }
Response: { message, project }
Auth: Required + (Admin or Assigner role)
```

#### Delete Project (Admin Only)

```
DELETE /api/workspaces/:workspaceId/projects/:projectId
Response: { message }
Auth: Required + Admin role
```

#### Add Assigner to Project (Admin Only)

```
POST /api/workspaces/:workspaceId/projects/:projectId/assigners
Body: { email }
Response: { message, project }
Auth: Required + Admin role
```

#### Add Worker to Project (Admin/Assigner)

```
POST /api/workspaces/:workspaceId/projects/:projectId/workers
Body: { email }
Response: { message, project }
Auth: Required + (Admin or Assigner role)
```

#### Remove Project Member (Admin Only)

```
DELETE /api/workspaces/:workspaceId/projects/:projectId/members
Body: { userId, role: "assigner"|"worker" }
Response: { message, project }
Auth: Required + Admin role
```

---

### WORKSPACE TASK MANAGEMENT

#### Create Workspace Task (Assigner Only)

```
POST /api/workspaces/:workspaceId/projects/:projectId/tasks
Body: {
  title: string (required),
  description?: string,
  priority?: "low"|"medium"|"high",
  dueDate?: date,
  tags?: string[],
  assignedTo: userId (required) - worker to assign task to
}
Response: { message, task }
Auth: Required + Project Assigner role
Note: Task creator = assigner, assignedBy = assigner
```

#### Get Workspace Tasks (Role-Based)

```
GET /api/workspaces/:workspaceId/tasks
Query: ?status=pending&priority=high&search=query&sort=-createdAt
Response: { message, total, tasks[] }
Auth: Required (workspace member)
Note:
- Workers see only assigned tasks
- Assigners see tasks they created
- Admins see all tasks
```

#### Get Workspace Task Stats (Role-Based)

```
GET /api/workspaces/:workspaceId/tasks/stats
Response: {
  message,
  stats: {
    total, pending, inProgress, completed,
    pendingApproval, approved, rejected
  }
}
Auth: Required (workspace member)
Note: Stats filtered by role (same as get tasks)
```

#### Mark Task as Complete (Worker Only)

```
PATCH /api/tasks/:id/mark-complete
Response: { message, task }
Auth: Required + Must be assignedTo worker
Note: Status becomes "completed", approvalStatus becomes "pending-approval"
```

#### Approve/Reject Task (Assigner Only)

```
PATCH /api/tasks/:id/approval
Body: {
  action: "approve"|"reject",
  feedback?: string
}
Response: { message, task }
Auth: Required + Must be assignedBy assigner
Note:
- approve: approvalStatus = "approved" (task done)
- reject: approvalStatus = "rejected", status = "pending" (back to work)
```

---

## 📁 File Structure Created

```
backend/src/
├── models/
│   ├── Workspace.ts (NEW)
│   ├── Project.ts (NEW)
│   ├── Task.ts (EXTENDED)
│   └── Subtask.ts (EXTENDED)
├── controllers/
│   ├── workspaceController.ts (NEW)
│   ├── projectController.ts (NEW)
│   └── taskController.ts (EXTENDED)
├── routes/
│   ├── workspaceRoutes.ts (NEW)
│   ├── projectRoutes.ts (NEW)
│   └── taskRoutes.ts (EXTENDED)
├── middlewares/
│   ├── auth.ts (EXTENDED - added authenticate alias)
│   └── workspaceAuth.ts (NEW)
└── app.ts (UPDATED)

frontend/src/
└── types/
    └── index.ts (EXTENDED with Workspace/Project types)
```

---

## 🔐 Middleware Chain

```
1. authenticate (existing) - Verify JWT token, set req.userId
2. verifyWorkspaceMember - Check workspace membership, set req.userRole
3. verifyWorkspaceAdmin - Check for admin role
4. verifyWorkspaceAssigner - Check for admin or assigner role
5. verifyProjectMember - Check project membership (for project-specific routes)
6. verifyProjectAssigner - Check project assigner role
```

---

## ✅ Key Features Implemented

### Personal Tasks (Existing - Unchanged)

- Keep all existing personal task CRUD as-is
- workspaceId = null means personal task
- Existing dashboard and stats work unchanged

### Workspace Management

- Create workspaces (creator = admin)
- Add members with roles (admin/assigner/worker)
- Update member roles
- Remove members
- Delete workspace (creator only)

### Project Management

- Create projects within workspace (admin/assigner)
- Assign assigners and workers to projects
- Archive/activate projects
- Delete projects (admin only)

### Task Assignment & Approval Workflow

- Assigner creates task and assigns to worker
- Worker marks task as completed
- Assigner reviews and approves/rejects
- Rejected tasks reset to pending
- Stats show approval pipeline

### RBAC at Scale

- Admin: Full control
- Assigner: Create tasks, assign to workers, approve completions
- Worker: Execute tasks, mark complete, await approval

---

## 🚀 Usage Examples

### 1. Create Workspace

```javascript
POST /api/workspaces
{ "name": "Acme Corp", "description": "Main company workspace" }
// User becomes admin automatically
```

### 2. Add Member (Admin)

```javascript
POST /api/workspaces/ws123/members
{ "email": "john@acme.com", "role": "assigner" }
```

### 3. Create Project (Admin/Assigner)

```javascript
POST /api/workspaces/ws123/projects
{ "name": "Website Redesign", "description": "2024 Q1 project" }
```

### 4. Add Worker to Project

```javascript
POST /api/workspaces/ws123/projects/proj456/workers
{ "email": "worker@acme.com" }
```

### 5. Create Task (Assigner)

```javascript
POST /api/workspaces/ws123/projects/proj456/tasks
{
  "title": "Design homepage mockup",
  "description": "Create Figma design for homepage",
  "priority": "high",
  "dueDate": "2024-02-01",
  "assignedTo": "worker_id_here"
}
```

### 6. Worker Marks Complete

```javascript
PATCH / api / tasks / task_id / mark - complete;
// Task now in "pending-approval" status
```

### 7. Assigner Approves

```javascript
PATCH /api/tasks/task_id/approval
{ "action": "approve" }
// Task now "approved"
```

---

## 📊 Database Indexes (Auto-Created)

```
Workspace:
- creator: 1
- members.userId: 1

Project:
- workspaceId: 1, status: 1
- assigners.userId: 1
- workers.userId: 1

Task:
- userId: 1, createdAt: -1
- workspaceId: 1, projectId: 1, status: 1
- assignedTo: 1, approvalStatus: 1
- assignedBy: 1

Subtask:
- taskId: 1, createdAt: -1
- workspaceId: 1
- projectId: 1
```

---

## 🔄 Phase 2 Enhancements (Future)

- Email notifications on task assignment/approval
- Audit logs for all actions
- Workspace-level analytics dashboard
- Bulk member import (CSV)
- Workspace templates
- Sub-teams within workspace
- Custom workflows
- Time tracking per task
- Recurring tasks
- Task dependencies
- Integration with Slack/Teams
- Activity feed
- Advanced permissions system

---

## 🧪 Testing Checklist

- [ ] Create workspace as user A
- [ ] Add user B as assigner
- [ ] Add user C as worker
- [ ] User B creates project
- [ ] User B assigns task to user C
- [ ] User C marks task complete
- [ ] User B approves task
- [ ] User A can see all stats
- [ ] User B can only see their tasks
- [ ] User C can only see assigned tasks
- [ ] Personal tasks still work for all users
- [ ] Member removal works correctly
- [ ] Rejected task resets status

---

## ⚠️ Important Notes

1. **Personal Tasks Preserved**: All existing personal task functionality remains unchanged (workspaceId = null)
2. **JWT Auth**: Same auth mechanism as before - new middleware stacks on top
3. **Type Safety**: Full TypeScript support for all new types
4. **Indexing**: Optimized queries with strategic MongoDB indexes
5. **Error Handling**: Comprehensive error responses with meaningful messages
6. **Scalability**: Ready for thousands of users and workspaces

---

## 📝 Next Steps

1. Create frontend components for workspace management
2. Implement workspace selector/switcher in UI
3. Create project board component (Kanban view)
4. Build admin panel for member management
5. Create worker dashboard showing assigned tasks
6. Add notifications system
7. Implement audit logging
8. Create workspace invitation system via email
9. Add workspace templates for quick setup
10. Setup deployment with database migrations
