# CLAIR - Contextual Learning Assistant for Issue Resolution

CLAIR is an AI-powered tool designed to enhance your workflow in Jira and Confluence by providing contextually relevant information to help resolve issues faster. By leveraging OpenAI’s models, CLAIR analyzes the context of your Jira issues and suggests related Jira issues and Confluence pages, all within a streamlined interface.

---

## What it does

CLAIR enhances your issue resolution process by:

- **Contextual Recommendations:** CLAIR automatically analyzes the context of your Jira issues and suggests related Jira issues and Confluence pages based on titles, descriptions, and metadata.
  
- **CLAIR Insights:** The main feature of CLAIR is the **CLAIR Insights** panel, which provides a list of relevant Jira issues and Confluence pages to help resolve your current issue.

- **CLAIR Notes:** You can save related Jira issues and Confluence pages from **CLAIR Insights** into **CLAIR Notes** for easy access and reference later.

- **Seamless Integration:** CLAIR works seamlessly with Jira and Confluence, improving the efficiency of teams by providing immediate access to related information without leaving the issue view.

---

## How we built it

CLAIR was built using **Atlassian Forge** to integrate smoothly with Jira and Confluence. Here’s how we built the core features:

1. **Integration with Jira and Confluence:**
   CLAIR leverages the Atlassian Forge platform to integrate with Jira and Confluence. It uses APIs to fetch and display related Jira issues and Confluence pages in real-time.

2. **OpenAI API for Contextual Recommendations:**
   CLAIR uses the **OpenAI API** to analyze the context of Jira issues and suggest relevant resources. By utilizing powerful NLP models, CLAIR generates context-driven insights, including related issues and knowledge pages.

3. **Dynamic Insights and Data Saving:**
   The **CLAIR Insights** panel dynamically generates relevant content based on your active Jira issue. Users can easily save relevant content into **CLAIR Notes**, where they can access it later, making knowledge retrieval much faster and more efficient.

4. **Customizable Settings:**
   CLAIR offers customizable settings for configuring the **OpenAI API key** and model, giving users flexibility in how the tool operates. You can also set retention rules for CLAIR Insights to control how long recommendations are stored.

---

## Installation

1. Install CLAIR from the provided link in your Atlassian environment.
2. Configure the **OpenAI API Key** and select the model in the **CLAIR Settings** page.
3. Once installed, CLAIR will automatically start suggesting related Jira issues and Confluence pages based on your active issue.

---

## Usage

- **CLAIR Insights:** View related Jira issues and Confluence pages directly within your Jira issues.
- **CLAIR Notes:** Save relevant insights for future reference with just a click.
- **CLAIR Settings:** Configure your OpenAI API Key and adjust settings as needed to fine-tune recommendations.

---

## Contributing

If you'd like to contribute to CLAIR, feel free to fork the repository, create a branch, and submit a pull request. We're open to suggestions and improvements!

---

## License

CLAIR is released under the [MIT License](LICENSE).
