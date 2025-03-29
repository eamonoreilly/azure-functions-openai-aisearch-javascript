const { app, input, output } = require("@azure/functions");

const path = require('path');

const embeddingsStoreOutput = output.generic({
    type: "embeddingsStore",
    input: "{Text}", 
    inputType: "RawText", 
    connectionName: "AZURE_AISEARCH_ENDPOINT", 
    collection: "openai-index", 
    model: "%EMBEDDING_MODEL_DEPLOYMENT_NAME%"
});


app.http('ingest', {
    methods: ['POST'],
    authLevel: 'function',
    extraOutputs: [embeddingsStoreOutput],
    handler: async (request, context) => {
        let requestBody = await request.json();

        message  = requestBody.Text;

        context.extraOutputs.set(embeddingsStoreOutput, { title: requestBody.Title });

        let response = {
            status: "success",
            title: requestBody.Title,
            text: "Ingested successfully"
        };

        return { status: 202, jsonBody: response } 
    }
});

const semanticSearchInput = input.generic({
    type: "semanticSearch",
    connectionName: "AZURE_AISEARCH_ENDPOINT",
    collection: "openai-index",
    query: "{question}",
    chatModel: "%CHAT_MODEL_DEPLOYMENT_NAME%",
    embeddingsModel: "%EMBEDDING_MODEL_DEPLOYMENT_NAME%"
});

app.http('ask', {
    methods: ['POST'],
    authLevel: 'function',
    extraInputs: [semanticSearchInput],
    handler: async (_request, context) => {
        var responseBody = context.extraInputs.get(semanticSearchInput)

        return { status: 200, body: responseBody.Response.trim() }
    }
});