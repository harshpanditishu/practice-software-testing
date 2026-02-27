User Stories – Sprint 5
Sprint 5 is the full production version. It adds a shopping cart with server-side persistence, advanced payment methods, a password strength indicator, account locking, two-factor authentication, social login, PDF invoices, an admin dashboard, a chat widget, discounts, multi-language support, a price range filter, and a privacy policy page. All Sprint 4 features carry forward with enhancements.

Product Overview
User Story
As a visitor, I want to browse a paginated overview of all products with search, filtering, sorting, and a price range slider, so that I can efficiently find products within my preferences and budget.

Acceptance Criteria
AC1 – Product grid is displayed
Given I navigate to the home page
Then a grid of product cards is displayed
And each card shows a product image, name, and price.

AC2 – Navigating to product detail
Given the product overview is displayed
When I click on a product card
Then I am navigated to the product detail page.

AC3 – Pagination
Given there are more products than fit on one page
Then pagination controls are displayed below the product grid
And clicking a page number updates the grid.

AC4 – Search
Given I enter a valid search query (3–40 characters) and submit
Then the product grid updates to show only matching products
And all active filters are reset.

AC5 – Category filter
Given I check one or more category checkboxes in the sidebar
Then the product grid updates to show only products from those categories.

AC6 – Hierarchical category selection
Given a parent category has child categories
When I check the parent category checkbox
Then all child category checkboxes are also checked
And unchecking all children unchecks the parent.

AC7 – Brand filter
Given I check one or more brand checkboxes in the sidebar
Then the product grid updates to show only products from those brands.

AC8 – Combining filters
Given I have selected categories and brands
Then the product grid shows only products matching both filters.

AC9 – Sorting
Given I select a sort option (Name A-Z, Name Z-A, Price High-Low, Price Low-High)
Then the product grid reloads with products ordered accordingly.

AC10 – Price range slider
Given I am on the product overview page
Then a price range slider is displayed in the sidebar with a default range of $1 to $100 and a maximum of $200.

AC11 – Adjusting the price range
Given I drag the slider handles to a new minimum and maximum
Then the product grid updates to show only products within the selected price range.

AC12 – Discount price display
Given a product has a discount (location-based or otherwise)
Then the product card shows the original price with a strikethrough and the discounted price below.

AC13 – Out of stock indicator
Given a product has no stock available
Then "Out of stock" is displayed on the product card.

Product Detail
User Story
As a visitor, I want to view a product's details, add it to my cart, or save it to my favorites, so that I can purchase it or come back to it later.

Acceptance Criteria
AC1 – Product information shown
Given I am on the product detail page
Then the product image, name, description, price, category badge, and brand badge are shown.

AC2 – Discount price display
Given the product has a discount
Then the original price is shown with a strikethrough
And the discounted price and discount percentage badge are displayed.

AC3 – Quantity selector
Given the product is in stock
Then a quantity input field is displayed with plus (+) and minus (-) buttons
And the default quantity is 1.

AC4 – Increase quantity
Given the quantity input is displayed
When I click the plus button
Then the quantity increases by 1.

AC5 – Decrease quantity
Given the quantity is greater than 1
When I click the minus button
Then the quantity decreases by 1.

AC6 – Minimum quantity
Given the quantity is 1
When I click the minus button
Then the quantity remains at 1.

AC7 – Manual quantity entry
Given the quantity input is displayed
When I type a number directly into the input field
Then the quantity is updated to the entered value
And the value is clamped between 1 and 999,999,999.

AC8 – Add to cart
Given a valid quantity is selected
When I click the "Add to Cart" button
Then the product is added to the cart with the selected quantity
And a success message "Product added to shopping cart." is displayed.

AC9 – Out of stock
Given the product is not in stock and is not a rental item
Then the "Add to Cart" button is disabled
And "Out of stock" is shown in red.

AC10 – Rental duration slider
Given the product is a rental item
Then a duration slider (1–10 hours) is shown instead of plus/minus buttons
And the total price is calculated as hourly rate multiplied by duration.

AC11 – Add to Favorites
Given I am logged in
When I click "Add to Favorites"
Then a success message "Product added to your favorites list." is displayed.

AC12 – Duplicate favorite
Given the product is already in my favorites
When I click "Add to Favorites"
Then the message "Product already in your favorites list." is displayed.

AC13 – Not logged in
Given I am not logged in
When I click "Add to Favorites"
Then the message "Unauthorized, can not add product to your favorite list." is displayed.

AC14 – Related products
Given the product detail page is displayed
Then related products are shown below the main information.

Rental Products
User Story
As a visitor, I want to browse products available for rent, so that I can find tools I can rent by the hour.

Acceptance Criteria
AC1 – Rentals page is accessible
Given I navigate to the rentals page
Then a list of all rental products is displayed.

AC2 – Rental product display
Given the rentals page is displayed
Then each rental product shows a product image, name, and description.

AC3 – Rental detail page
Given I click on a rental product
Then the product detail page shows a duration slider (1–10 hours) instead of plus/minus buttons
And the total price is calculated as the hourly rate multiplied by the selected duration.

AC4 – Rental label in checkout
Given a rental item is in my cart
Then the item is marked with "This is a rental item" in the checkout cart.

AC5 – Location-based discount on rentals
Given a rental product is marked as a location offer
And my location matches a supported city
Then the location discount is applied to the rental price.

Checkout – Cart Review
User Story
As a customer, I want to review the items in my cart, including any applied discounts, so that I can verify my order is correct.

Acceptance Criteria
AC1 – Cart contents displayed
Given I have items in my cart
When I navigate to the checkout page
Then a table is displayed with columns: Item, Quantity, Price, Total, and Actions.

AC2 – Update quantity
Given I change the quantity of a cart item
Then the item total and cart total are recalculated
And a confirmation message "Product quantity updated." is displayed.

AC3 – Delete item
Given I click the delete button on a cart item
Then the item is removed from the cart
And the cart total is recalculated.

AC4 – Empty cart
Given I have no items in my cart
Then the message "Your shopping cart is empty" is displayed.

AC5 – Proceed
Given the cart contains at least one item
When I click "Proceed"
Then I advance to the next checkout step.

AC6 – Discount badge on items
Given a cart item has a discount
Then a discount badge is shown next to the product name
And both the original and discounted price are displayed.

AC7 – Combined product discount
Given the cart contains both rental and non-rental items
Then a 15% additional discount is applied to the cart subtotal
And the cart shows the subtotal, discount amount, and final total.

AC8 – Combined discount removed
Given I remove all rental or all non-rental items
Then the 15% combined discount is removed
And the total reverts to the regular subtotal.

Checkout – Sign In
User Story
As a user who is not logged in, I want the possibility to log in during the checkout workflow, so that I can complete my purchase without leaving the checkout.

Acceptance Criteria
AC1 – Login step displayed for guests
Given I am not logged in
And I am on the checkout page
When I click "Proceed to Checkout" from the cart step
Then a login form is displayed as the next step in the checkout wizard.

AC2 – Login form fields
Given the checkout login step is displayed
Then email and password fields are shown
And a submit button is available.

AC3 – TOTP support during checkout login
Given I have TOTP enabled on my account
When I submit valid email and password on the checkout login step
Then a 6-digit TOTP input field is displayed
And I must enter a valid TOTP code to proceed.

AC4 – Successful login during checkout
Given I enter valid credentials on the checkout login step
When I submit the form
Then I am authenticated
And I can proceed to the billing address step.

AC5 – Already logged in
Given I am already logged in
When I reach the checkout login step
Then a message "You are already signed in as [First Name] [Last Name]" is displayed
And I can proceed directly to the billing address step.

Checkout – Billing Address
User Story
As a customer, I want to enter my billing address, pre-filled from my account if logged in, so that my invoice is accurate.

Acceptance Criteria
AC1 – Address form fields
Given I am on the billing address step
Then the following required fields are displayed:

Street (max 70 characters)
City (max 40 characters)
State (max 40 characters)
Country (max 40 characters)
Postal code (max 10 characters)
AC2 – Validation
Given I leave a required field empty
Then the field is highlighted as invalid
And the "Proceed" button is disabled.

AC3 – Proceed to payment
Given all address fields are filled in
When I click "Proceed"
Then I advance to the payment step.

AC4 – Pre-fill for logged-in users
Given I am logged in
Then the address fields are pre-filled with my account address details.