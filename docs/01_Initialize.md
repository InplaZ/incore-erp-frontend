# Configuración inicial del repositorio

Este documento describe la configuración inicial del repositorio del frontend de INCORE ERP.

## 1. Crear el repositorio

Se creó el repositorio remoto en GitHub:

`incore-erp-frontend`

Repositorio:

`https://github.com/InplaZ/incore-erp-frontend`

El repositorio se creó vacío, sin README, `.gitignore` ni licencia, debido a que estos archivos fueron configurados localmente.

---

## 2. Inicializar Git

Desde la carpeta del proyecto Frontend se inicializó el repositorio local:

```bash
    git init

Se establecio main como rama principal
    git branch -M main

Se creó la rama develop para trabajar durante el desarrollo del sistema
    git checkout -b develop

Pasos para subir el proyecto por primera vez:
    git init
    git status
    git add .
    git commit -m "chore: initialize front project"
    git remote add origin https://github.com/InplaZ/incore-erp-frontend.git
    git push -u origin develp
    
