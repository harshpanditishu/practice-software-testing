# Product Overview AC Traceability (Batch 1)

| Test ID | Test Name | User Story | AC IDs Covered |
|---|---|---|---|
| PO-001 | AC1 product grid cards show image name and price | Product Overview | AC1 |
| PO-002 | AC2 clicking product opens product detail page | Product Overview | AC2 |
| PO-003 | AC3 pagination is visible and page navigation works | Product Overview | AC3 |
| PO-004 | AC4 search updates result set and resets brand filter selection | Product Overview | AC4 |
| PO-005 | AC5 category filter triggers category-based product query | Product Overview | AC5 |
| PO-006 | AC6 checking parent checks children and unchecking all children unchecks parent | Product Overview | AC6 |
| PO-007 | AC7+AC8 brand and category filters can be combined | Product Overview | AC7, AC8 |
| PO-008 | AC9 sorting by price low-high updates query and orders visible prices | Product Overview | AC9 |
| PO-009 | AC10+AC11 price range slider is visible and changing slider updates product query | Product Overview | AC10, AC11 |
| PO-010 | AC12 discount price and AC13 out-of-stock indicator are shown when applicable | Product Overview | AC12, AC13 |

## Notes
- Tests are designed for dual-environment execution (`ui-prod` and `ui-local`) using `baseURL` from Playwright project configuration.
- Assertions are behavior-focused and avoid fragile fixed counts due to environment data variance.
