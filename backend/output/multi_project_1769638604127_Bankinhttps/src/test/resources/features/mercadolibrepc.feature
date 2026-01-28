Feature: MercadolibrePC Automation

  Scenario: Escenario exitoso - Buscar un producto
    Given el usuario navega a la página de inicio de Mercado Libre
    When el usuario ingresa 'computadores' en la barra de búsqueda
    Then el usuario debe ver una lista de resultados de búsqueda

  Scenario: Escenario exitoso - Seleccionar un producto
    Given el usuario navega a la página de inicio de Mercado Libre
    When el usuario busca 'computadores' y selecciona un producto
    Then el usuario debe ser redirigido a la página del producto

  Scenario: Escenario de error - Buscar un producto inexistente
    Given el usuario navega a la página de inicio de Mercado Libre
    When el usuario ingresa 'producto_inexistente' en la barra de búsqueda
    Then el usuario debe ver un mensaje de error indicando que no se encontraron resultados