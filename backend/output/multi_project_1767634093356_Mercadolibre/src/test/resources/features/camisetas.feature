Feature: Camisetas Automation

  Scenario: Escenario exitoso - Buscar camisetas
    Given el usuario navega a la página principal de Mercado Libre
    When el usuario busca 'camisetas' en la barra de búsqueda
    Then debe ver una lista de resultados de camisetas

  Scenario: Escenario exitoso - Seleccionar camiseta
    Given el usuario navega a la página principal de Mercado Libre
    When el usuario busca 'camisetas' y selecciona una camiseta
    Then debe ver los detalles de la camiseta seleccionada

  Scenario: Escenario de error - Buscar camiseta sin conexión a internet
    Given el usuario navega a la página principal de Mercado Libre
    When el usuario intenta buscar 'camisetas' sin conexión a internet
    Then debe ver un mensaje de error de conexión