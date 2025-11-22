# API Routes Migration Guide

This document explains how to update API routes to support user authentication.

## Pattern to Follow

For each API endpoint, add these changes:

### 1. Import requireUserId (automatic via server/utils)
The `requireUserId` function is automatically available in all server routes via `server/utils/auth.ts`.

### 2. Get the authenticated user ID
At the start of your event handler:
```typescript
const userId = await requireUserId(event)
```

### 3. Update queries to filter by userId
For GET endpoints:
```typescript
const where: any = {
  userId, // Add this to filter by user
  // ...other conditions
}
```

### 4. Update creates to include userId
For POST endpoints:
```typescript
const item = await prisma.model.create({
  data: {
    userId, // Add this to associate with user
    // ...other fields
  }
})
```

### 5. Update individual item access
For [id].get.ts, [id].put.ts, [id].delete.ts:
```typescript
const userId = await requireUserId(event)
const id = getRouterParam(event, 'id')

const item = await prisma.model.findFirst({
  where: {
    id,
    userId // Ensure user owns this item
  }
})

if (!item) {
  throw createError({
    statusCode: 404,
    message: 'Not found'
  })
}
```

## Files Status

### Medicines API (DONE ✓)
- ✅ `/server/api/medicines/index.get.ts`
- ✅ `/server/api/medicines/index.post.ts`
- ✅ `/server/api/medicines/[id].get.ts`
- ✅ `/server/api/medicines/[id].put.ts`
- ✅ `/server/api/medicines/[id].delete.ts`

### Reminders API (DONE ✓)
- ✅ `/server/api/reminders/index.get.ts`
- ✅ `/server/api/reminders/index.post.ts`
- ✅ `/server/api/reminders/[id].put.ts`
- ✅ `/server/api/reminders/[id].delete.ts`
- ✅ `/server/api/reminders/[id]/record.post.ts`

### Records API (DONE ✓)
- ✅ `/server/api/records/index.get.ts`
- ✅ `/server/api/records/index.post.ts`
- ✅ `/server/api/records/[id].delete.ts`
- ✅ `/server/api/records/[id].put.ts`

### Vitals API (DONE ✓)
- ✅ `/server/api/vitals/index.get.ts`
- ✅ `/server/api/vitals/index.post.ts`
- ✅ `/server/api/vitals/[id].delete.ts`
- ✅ `/server/api/vitals/[id].get.ts`
- ✅ `/server/api/vitals/[id].put.ts`
- ✅ `/server/api/vitals/reminders/index.get.ts`
- ✅ `/server/api/vitals/reminders/index.post.ts`
- ✅ `/server/api/vitals/reminders/[id].delete.ts`
- ✅ `/server/api/vitals/reminders/[id].put.ts`
- ✅ `/server/api/vitals/reference-ranges/index.get.ts`

### Stats API (DONE ✓)
- ✅ `/server/api/stats/index.get.ts`

## Testing

1. **Start the dev server**: `npm run dev`
2. **Register a new user** at `/register`
3. **Create some data** (medicines, vitals, etc.)
4. **Log out** and **log in as a different user**
5. **Verify** that the new user cannot see the first user's data
6. **Verify** that each user only sees their own data
