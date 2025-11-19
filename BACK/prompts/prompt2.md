# **🔐 Módulo 2 — Autenticación, Roles y Gestión de Usuarios**

### **Prompt**

> **Objetivo:** Implementar autenticación JWT, roles (Admin, Docente, Estudiante) y CRUD de usuarios.
>
> **Instrucciones:**
>
> * Crear modelo User con campos:
>
>   * id, nombre, email, hash_password, rol, créditos (por defecto 500), created_at
> * Implementar Hash de contraseñas con passlib.
> * Implementar login (JWT) y refresh token.
> * Implementar endpoints:
>
>   * POST /register
>   * POST /login
>   * GET /me
>   * GET /users (solo Admin)
> * Middleware para proteger rutas según rol.
> * Validar emails duplicados.
>
> **Resultado:**
> Sistema completo de autenticación + control de roles + esquema de créditos iniciales.
