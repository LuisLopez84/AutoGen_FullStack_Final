Feature: Reloj Automation

  Scenario: Escenario exitoso - Buscar reloj
    Given el usuario navega a la página principal de Mercado Libre
    When el usuario ingresa 'reloj hombre' en la barra de búsqueda
    Then debe ver una lista de resultados relacionados con 'reloj hombre'

  Scenario: Escenario exitoso - Seleccionar un reloj
    Given el usuario navega a la página de resultados de búsqueda de relojes
    When el usuario selecciona un reloj de la lista
    Then debe ser redirigido a la página de detalles del reloj seleccionado

  Scenario: Escenario de error - Buscar reloj sin resultados
    Given el usuario navega a la página principal de Mercado Libre
    When el usuario ingresa 'reloj inexistente' en la barra de búsqueda
    Then debe ver un mensaje indicando que no se encontraron resultados