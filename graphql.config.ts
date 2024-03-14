import dotenv from "dotenv";
import type { IGraphQLConfig } from "graphql-config";

dotenv.config({ path: ".dev.vars" });

const config: IGraphQLConfig = {
	schema: [
		{
			"https://graphql.datocms.com": {
				headers: {
					Authorization: `Bearer ${process.env.DATOCMS_READONLY_API_TOKEN}`,
					"X-Exclude-Invalid": "true",
				},
			},
		},
	],
	documents: ["./app/**/*.tsx"],
	extensions: {
		codegen: {
			generates: {
				"./app/gql/": {
					preset: "client",
					presetConfig: {
						fragmentMasking: { unmaskFunctionName: "getFragmentData" },
					},
					config: {
						// String documentMode (https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#when-to-use-a-string-documentmode) does not work with nested fragments
						// documentMode: "string",
						strictScalars: true,
						scalars: {
							BooleanType: "boolean",
							CustomData: "Record<string, unknown>",
							Date: "string",
							DateTime: "string",
							FloatType: "number",
							IntType: "number",
							ItemId: "string",
							JsonField: "unknown",
							MetaTagAttributes: "Record<string, string>",
							UploadId: "string",
						},
					},
				},
			},
		},
	},
};

export default config;
