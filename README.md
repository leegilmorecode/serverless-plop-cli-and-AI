# Serverless Plop CLI and AI

### AI Clean Code Generation through a Plop CLI using TypeScript &amp; Amazon Bedrock

Using AI to enhance our clean code generation Plop CLI to generate the complex parts, using TypeScript and the AWS CDK

**NOTE: This is a basic example of the CLI to show the templating approach with Plop & AI - this is not production ready.**

![image](./docs/images/header.png)

The article can be found here: https://blog.serverlessadvocate.com/ai-clean-code-generation-through-a-plop-cli-using-typescript-amazon-bedrock-64bb7ae08a76

## Getting started

Let's start by installing this local package as if it is a npm package:

1. change directory into the advocate-cli folder

```
cd into advocate-cli
```

2. Install the dependencies:

```
npm i
```

3. build the CLI and link this in dev mode like a global package

```
npm run build && npm run link
```

**Now let's deploy the AI API:**

1. cd into the ai-service folder

```
cd ../ai-service
```

2. deploy the application

```
npm run deploy
```

now you can run the CLI by typing:

```
advocate
```

---

To run the solution please look at the steps in the article linked above.

** The information and code provided are my own and I accept no responsibility on the use of the information. **
