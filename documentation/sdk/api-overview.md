---
id: overview
title: "🏠 API Overview"
sidebar_label: "🏠 API Overview"
slug: /overview
---

# 🧭 API Overview

Esta sección proporciona una visión técnica detallada de las interfaces disponibles en el `StableCoinClient`. El SDK actúa como el orquestador principal para interactuar con los Smart Contracts de la red.

---

## 🚀 Inicialización

Para utilizar cualquiera de los métodos descritos a continuación, primero debes instanciar el cliente con un proveedor válido y un firmante si deseas realizar transacciones.

```typescript
import { StableCoinClient, Network } from '@your-sdk/core';

const client = new StableCoinClient({
  network: Network.Mainnet,
  provider: window.ethereum,
  signer: mySigner
});
```

---

## 🛠️ Core Methods (Write Operations)

Estos métodos ejecutan transacciones que modifican el estado de la blockchain. Requieren permisos (roles) específicos.

¡Dicho y hecho! He completado la tabla añadiendo los métodos que faltaban para que coincidan con todos los roles que mencionamos antes (RESCUE, PAUSE completo, ADMIN, etc.) y he incluido la operación de transfer, que es básica.

Aquí tienes la tabla actualizada para que la pegues en tu script o en el .md:

Markdown

## 🛠️ Core Methods (Write Operations)

Estos métodos ejecutan transacciones que modifican el estado de la blockchain. Requieren permisos (roles) específicos asignados a la dirección del firmante.

| Método | Parámetros Principales | Descripción | Roles Requeridos |
| :--- | :--- | :--- | :--- |
| `createStableCoin(req)` | `name, symbol, decimals` | Despliega una nueva instancia vía Factory. | None (Owner) |
| `mint(req)` | `address, amount` | Emite nuevos tokens a una cuenta destino. | `CASHIN_ROLE` |
| `burn(req)` | `amount` | Quema tokens de la tesorería (Supply reduction). | `BURN_ROLE` |
| `wipe(req)` | `address, amount` | Elimina tokens de una cuenta externa por cumplimiento. | `WIPE_ROLE` |
| `transfer(req)` | `address, amount` | Envía tokens a otra dirección. | None |
| `freeze(req)` | `address` | Bloquea las transferencias de una cuenta específica. | `FREEZE_ROLE` |
| `unfreeze(req)` | `address` | Desbloquea una cuenta previamente congelada. | `FREEZE_ROLE` |
| `grantKyc(req)` | `address` | Marca una cuenta como verificada. | `KYC_ROLE` |
| `revokeKyc(req)` | `address` | Revoca el estado de verificación de una cuenta. | `KYC_ROLE` |
| `pause()` | `-` | Detiene todas las operaciones (emergencia). | `PAUSE_ROLE` |
| `unpause()` | `-` | Reanuda las operaciones del contrato. | `PAUSE_ROLE` |
| `rescue(req)` | `token, address, amount` | Recupera activos enviados por error al contrato. | `RESCUE_ROLE` |
| `grantRole(req)` | `role, address` | Asigna un rol administrativo a una cuenta. | `DEFAULT_ADMIN_ROLE` |
| `revokeRole(req)` | `role, address` | Revoca un rol administrativo. | `DEFAULT_ADMIN_ROLE` |
---

## 🔍 Query Methods (Read Operations)

Consultas de estado sin coste de gas.

| Método | Retorno | Descripción |
| :--- | :--- | :--- |
| `getBalance(address)` | `BigNumber` | Saldo de tokens de una dirección. |
| `totalSupply()` | `BigNumber` | Tokens totales en circulación. |
| `isFrozen(address)` | `boolean` | Verifica si una cuenta está bloqueada. |
| `isKycPassed(address)`| `boolean` | Confirma si la cuenta tiene KYC. |

---

## 🛂 Access Control (Roles)

- **`CASHIN_ROLE`** 💵: Minteo de tokens.
- **`BURN_ROLE`** 🔥: Destrucción de tokens.
- **`WIPE_ROLE`** 🧹: Gestión de cumplimiento.
- **`FREEZE_ROLE`** ❄️: Bloqueo de cuentas.
- **`PAUSE_ROLE`** ⏸️: Pausa de emergencia.
- **`DEFAULT_ADMIN_ROLE`** 👑: Administrador maestro.

> [!IMPORTANT]
> El emisor de la transacción debe tener el rol correspondiente o la operación fallará.
