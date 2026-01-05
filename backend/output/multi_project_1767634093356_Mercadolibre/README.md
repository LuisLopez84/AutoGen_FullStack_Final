# Mercadolibre Automation Project - Múltiples Flujos

## Descripción
Proyecto de automatización generado automáticamente para la URL: https://www.mercadolibre.com.co/
Contiene 4 flujos de automatización diferentes.

## Flujos Incluidos
1. **Camisetas** - 48 pasos grabados
2. **Jugueteria** - 40 pasos grabados
3. **Reloj** - 51 pasos grabados
4. **Vehiculos** - 39 pasos grabados

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
