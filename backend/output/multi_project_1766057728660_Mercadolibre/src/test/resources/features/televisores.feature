Feature: Televisores Automation

  Scenario: Escenario exitoso - Buscar televisores
    Given "el usuario navega a la página principal de Mercado Libre"
    When "el usuario busca 'televisores' en la barra de búsqueda"
    Then "debe ver una lista de resultados de búsqueda"

  Scenario: Escenario exitoso - Seleccionar un televisor
    Given "el usuario navega a la página principal de Mercado Libre"
    When "el usuario busca 'televisores' y selecciona un televisor"
    Then "debe ser redirigido a la página del producto"

  Scenario: Escenario de error - Buscar un producto inexistente
    Given "el usuario navega a la página principal de Mercado Libre"
    When "el usuario busca 'producto_inexistente' en la barra de búsqueda"
    Then "debe ver un mensaje de error indicando que no se encontraron resultados"