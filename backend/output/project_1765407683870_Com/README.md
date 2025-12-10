# Com Automation Project

## Descripción
Proyecto de automatización generado automáticamente para la URL: https://www.mercadolibre.com.co/

## Tecnologías
- Java 21
- Serenity BDD 4.2.22
- Cucumber 7.20.1
- Screenplay Pattern
- Maven

## Estructura del Proyecto
```
src/
├── main/java/co/com/template/automation/testing/
│   ├── ui/          # Page Objects
│   ├── tasks/       # Screenplay Tasks
│   └── questions/   # Screenplay Questions
└── test/java/co/com/template/automation/testing/
    ├── definitions/ # Step Definitions
    ├── runners/     # Test Runners
    └── hooks/       # Cucumber Hooks
```

## Ejecución
```bash
# Ejecutar todas las pruebas
mvn clean verify

# Ejecutar pruebas específicas
mvn clean verify -Dcucumber.filter.tags="@smoke"
```

## Configuración
La URL base se configura en: `src/test/resources/serenity.conf`

## Reportes
Los reportes se generan en: `target/site/serenity/index.html`

## Notas
Este proyecto fue generado automáticamente a partir de una grabación de usuario.