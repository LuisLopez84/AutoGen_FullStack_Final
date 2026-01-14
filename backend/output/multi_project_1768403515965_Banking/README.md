# Banking Automation Project - Múltiples Flujos

## Descripción
Proyecto de automatización generado automáticamente para la URL: https://banking.bstackdemo.website/login
Contiene 2 flujos de automatización diferentes.

## Flujos Incluidos
1. **BankQA_ConsultaCuenta** - 79 pasos grabados
2. **BankQA_DepositKO** - 73 pasos grabados

## Estructura del Proyecto
```
src/
├── main/java/co/com/template/automation/testing/
│   ├── ui/          # Page Objects (uno por flujo)
│   ├── tasks/       # Screenplay Tasks (uno por flujo)
│   └── questions/   # Screenplay Questions (uno por flujo)
└── test/java/co/com/template/automation/testing/
    ├── definitions/ # Step Definitions (uno por flujo)
    ├── runners/     # Test Runner (único)
    └── hooks/       # Cucumber Hooks (únicos)
```
