Feature: Com Automation

  Scenario: Escenario exitoso - Buscar computadores
    Given el usuario navega a la página principal de Mercado Libre
    When el usuario ingresa 'computadores' en la barra de búsqueda
    Then debe ver una lista de resultados de búsqueda relacionados con 'computadores'

  Scenario: Escenario exitoso - Seleccionar un producto
    Given el usuario navega a la página principal de Mercado Libre
    When el usuario busca 'computadores' y selecciona un producto
    Then debe ser redirigido a la página del producto seleccionado

  Scenario: Escenario de error - Buscar un producto inexistente
    Given el usuario navega a la página principal de Mercado Libre
    When el usuario ingresa 'producto_inexistente' en la barra de búsqueda
    Then debe ver un mensaje de error indicando que no se encontraron resultados