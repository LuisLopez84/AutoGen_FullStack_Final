Feature: Televisores Automation

  Scenario: Escenario exitoso - Buscar televisores
    Given el usuario navega a la página principal de Mercado Libre
    When busca 'televisores' en la barra de búsqueda
    Then debe ver una lista de resultados de búsqueda

  Scenario: Escenario exitoso - Filtrar por marca
    Given el usuario navega a la página de resultados de búsqueda de televisores
    When selecciona la marca 'Hyundai'
    Then debe ver resultados filtrados por la marca seleccionada

  Scenario: Escenario de error - Buscar un producto inexistente
    Given el usuario navega a la página principal de Mercado Libre
    When busca 'televisor que no existe' en la barra de búsqueda
    Then debe ver un mensaje de error indicando que no se encontraron resultados