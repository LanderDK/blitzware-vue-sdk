# BlitzWare Vue Role Check Example

This example demonstrates how to implement role-based access control in a Vue 3 application using the BlitzWare Vue SDK.

## Features

- **Role Checking**: Uses computed properties to check if the current user has specific roles
- **Conditional Rendering**: Shows/hides content based on user roles using `v-if`
- **Admin Section**: Content only visible to users with the "admin" role
- **Premium Section**: Content only visible to users with the "premium" role
- **Role Status Display**: Visual indicators showing which roles the user has

## Key Components

### Role Checking with Computed Properties
```javascript
const hasAdminRole = computed(() => {
  return BlitzWareAuth.user.value?.roles?.includes('admin') || false
})

const hasPremiumRole = computed(() => {
  return BlitzWareAuth.user.value?.roles?.includes('premium') || false
})
```

### Conditional Rendering
```vue
<div v-if="hasAdminRole" class="admin-section">
  <h3>🔒 Admin Only Section</h3>
  <p>This content is only visible to users with the admin role.</p>
</div>
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Navigate to `http://localhost:5173` to see the example in action.

## Usage

1. Log in using the BlitzWare authentication system
2. Observe the role status indicators showing which roles you have
3. See how content is conditionally displayed based on your roles
4. Try logging in with different users that have different roles to see the changes

## Role Configuration

The example checks for two roles:
- `admin`: Provides access to administrative features
- `premium`: Provides access to premium features

Users can have one, both, or neither of these roles, and the UI will adapt accordingly.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
