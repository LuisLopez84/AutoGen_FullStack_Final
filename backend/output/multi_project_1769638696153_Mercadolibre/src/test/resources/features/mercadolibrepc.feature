Feature: MercadolibrePC Automation

  Scenario: Escenario exitoso - Buscar producto
    Given el usuario navega a la página principal de Mercado Libre
    When el usuario busca 'computadores' en la barra de búsqueda
    Then debe ver una lista de resultados de búsqueda

  Scenario: Escenario exitoso - Seleccionar producto
    Given el usuario navega a la página principal de Mercado Libre
    When el usuario busca 'computadores' en la barra de búsqueda
    And el usuario selecciona un producto de la lista
    Then debe ver la página de detalles del producto

  Scenario: Escenario de error - Buscar producto no existente
    Given el usuario navega a la página principal de Mercado Libre
    When el usuario busca 'producto_inexistente' en la barra de búsqueda
    Then debe ver un mensaje de error indicando que no se encontraron resultados