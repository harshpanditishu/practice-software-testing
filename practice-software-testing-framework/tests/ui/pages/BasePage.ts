import { expect, Page } from '@playwright/test';

export class BasePage {
  constructor(protected readonly page: Page) {}

  async goto(path: string): Promise<void> {
    await this.page.goto(path);
  }
//explain the purpose of the expectUrlContains method and how it works.
// The `expectUrlContains` method is designed to verify that the current URL of the page contains a specific substring or pattern. This is useful in testing scenarios where you want to ensure that the user has navigated to the correct page after performing certain actions, such as clicking a link or submitting a form.
// The method takes a `pathPart` string as an argument, which represents the substring or pattern that should be present in the URL. It then escapes any special characters in the `pathPart` to ensure that it can be safely used in a regular expression. Finally, it uses Playwright's `expect` function to assert that the current URL of the page matches the regular expression created from the escaped `pathPart`. If the URL does not contain the specified substring, the assertion will fail, indicating that the navigation did not occur as expected.
//explain pathPart.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') in the expectUrlContains method.
// The expression `pathPart.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')` is used to escape special characters in the `pathPart` string so that it can be safely used in a regular expression. In regular expressions, certain characters have special meanings (such as `.` for any character, `*` for zero or more occurrences, `+` for one or more occurrences, etc.). If these characters are present in the `pathPart`, they could alter the intended pattern matching when used in a regular expression.
// The `replace` method is called on the `pathPart` string, and it uses a regular expression to find all occurrences of special characters that need to be escaped. 
// The regular expression `/[.*+?^${}()|[\]\\]/g` matches any of the characters listed within the square brackets. The `g` flag indicates that the replacement should be applied globally to all matches in the string.
// The replacement string `'\\$&'` tells the `replace` method to prepend a backslash (`\`) to each matched character. The `$&` is a special replacement pattern that represents the entire match found by the regular expression. By escaping these characters, the resulting string can be safely used in a regular expression without unintended consequences, ensuring that the `expectUrlContains` method checks for the literal presence of the `pathPart` in the URL.
//give an example of how to use the expectUrlContains method in a test case.
// Here's an example of how to use the `expectUrlContains` method in a test case using Playwright:
// Assume we have a test case where we want to verify that after clicking a "View Product" button, the user is navigated to a product details page that contains "/product/" in the URL.
// Example test case:


/**
 * The function `expectUrlContains` checks if the current URL contains a specific path part using a
 * regular expression.
 * @param {string} pathPart - The `pathPart` parameter is a string that represents a part of a URL path
 * that you want to check for in the current URL of a web page.
 */
  async expectUrlContains(pathPart: string): Promise<void> {
    const escaped = pathPart.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    await expect(this.page).toHaveURL(new RegExp(escaped));
  }

  //explain the purpose of the waitForProductsApiRequest method and how it works.
  // The `waitForProductsApiRequest` method is designed to wait for a specific API request related to products to occur during a test. This is particularly useful in scenarios where an action on the page triggers an API call to fetch product data, and you want to ensure that this call has been made before proceeding with further assertions or interactions.
  // The method takes a `predicate` function as an argument, which is a function that accepts a URL string and returns a boolean indicating whether the URL matches certain criteria. The method uses Playwright's `waitForResponse` function to listen for network responses. It checks each response to see if it is a GET request and if its URL includes the substring '/products'. 
  // If both conditions are met, it then applies the provided `predicate` function to the URL to determine if it matches the specific criteria defined in the test. The method will resolve once a matching response is detected, allowing the test to continue with confidence that the expected API call has
  // occurred.

  async waitForProductsApiRequest(predicate: (url: string) => boolean): Promise<void> {
    await this.page.waitForResponse((response) => {
      if (response.request().method() !== 'GET') {
        return false;
      }

      const url = response.url();
      return url.includes('/products') && predicate(url);
    });
  }
}