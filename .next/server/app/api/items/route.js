/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/items/route";
exports.ids = ["app/api/items/route"];
exports.modules = {

/***/ "(rsc)/./app/api/items/route.ts":
/*!********************************!*\
  !*** ./app/api/items/route.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET),\n/* harmony export */   POST: () => (/* binding */ POST)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/.pnpm/next@15.2.4_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/api/server.js\");\n/* harmony import */ var _lib_google_sheets__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/lib/google-sheets */ \"(rsc)/./lib/google-sheets.ts\");\n\n\nasync function GET(request) {\n    try {\n        const searchParams = request.nextUrl.searchParams;\n        const search = searchParams.get(\"search\");\n        let items = await (0,_lib_google_sheets__WEBPACK_IMPORTED_MODULE_1__.getInventoryItems)();\n        if (search) {\n            const searchLower = search.toLowerCase();\n            items = items.filter((item)=>item.name.toLowerCase().includes(searchLower) || item.sku.toLowerCase().includes(searchLower) || item.category.toLowerCase().includes(searchLower));\n        }\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json(items);\n    } catch (error) {\n        console.error(\"[v0] Error fetching items:\", error);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: \"Failed to fetch items\"\n        }, {\n            status: 500\n        });\n    }\n}\nasync function POST(request) {\n    try {\n        const body = await request.json();\n        const item = await (0,_lib_google_sheets__WEBPACK_IMPORTED_MODULE_1__.addInventoryItem)(body);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json(item);\n    } catch (error) {\n        console.error(\"[v0] Error creating item:\", error);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: \"Failed to create item\"\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2l0ZW1zL3JvdXRlLnRzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBNEQ7QUFDYTtBQUVsRSxlQUFlRyxJQUFJQyxPQUFvQjtJQUM1QyxJQUFJO1FBQ0YsTUFBTUMsZUFBZUQsUUFBUUUsT0FBTyxDQUFDRCxZQUFZO1FBQ2pELE1BQU1FLFNBQVNGLGFBQWFHLEdBQUcsQ0FBQztRQUVoQyxJQUFJQyxRQUFRLE1BQU1SLHFFQUFpQkE7UUFFbkMsSUFBSU0sUUFBUTtZQUNWLE1BQU1HLGNBQWNILE9BQU9JLFdBQVc7WUFDdENGLFFBQVFBLE1BQU1HLE1BQU0sQ0FDbEIsQ0FBQ0MsT0FDQ0EsS0FBS0MsSUFBSSxDQUFDSCxXQUFXLEdBQUdJLFFBQVEsQ0FBQ0wsZ0JBQ2pDRyxLQUFLRyxHQUFHLENBQUNMLFdBQVcsR0FBR0ksUUFBUSxDQUFDTCxnQkFDaENHLEtBQUtJLFFBQVEsQ0FBQ04sV0FBVyxHQUFHSSxRQUFRLENBQUNMO1FBRTNDO1FBRUEsT0FBT1YscURBQVlBLENBQUNrQixJQUFJLENBQUNUO0lBQzNCLEVBQUUsT0FBT1UsT0FBTztRQUNkQyxRQUFRRCxLQUFLLENBQUMsOEJBQThCQTtRQUM1QyxPQUFPbkIscURBQVlBLENBQUNrQixJQUFJLENBQUM7WUFBRUMsT0FBTztRQUF3QixHQUFHO1lBQUVFLFFBQVE7UUFBSTtJQUM3RTtBQUNGO0FBRU8sZUFBZUMsS0FBS2xCLE9BQW9CO0lBQzdDLElBQUk7UUFDRixNQUFNbUIsT0FBTyxNQUFNbkIsUUFBUWMsSUFBSTtRQUMvQixNQUFNTCxPQUFPLE1BQU1YLG9FQUFnQkEsQ0FBQ3FCO1FBQ3BDLE9BQU92QixxREFBWUEsQ0FBQ2tCLElBQUksQ0FBQ0w7SUFDM0IsRUFBRSxPQUFPTSxPQUFPO1FBQ2RDLFFBQVFELEtBQUssQ0FBQyw2QkFBNkJBO1FBQzNDLE9BQU9uQixxREFBWUEsQ0FBQ2tCLElBQUksQ0FBQztZQUFFQyxPQUFPO1FBQXdCLEdBQUc7WUFBRUUsUUFBUTtRQUFJO0lBQzdFO0FBQ0YiLCJzb3VyY2VzIjpbIkM6XFxVc2Vyc1xcQWl6ZW4wNlxcRG9jdW1lbnRzXFxJbnZlbnRvcnktTWFuYWdlbWVudC1TeXN0ZW1cXGxpYlxcSW52ZW50b3J5LU1hbmFnZW1lbnQtU3lzdGVtXFxhcHBcXGFwaVxcaXRlbXNcXHJvdXRlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHR5cGUgTmV4dFJlcXVlc3QsIE5leHRSZXNwb25zZSB9IGZyb20gXCJuZXh0L3NlcnZlclwiXHJcbmltcG9ydCB7IGdldEludmVudG9yeUl0ZW1zLCBhZGRJbnZlbnRvcnlJdGVtIH0gZnJvbSBcIkAvbGliL2dvb2dsZS1zaGVldHNcIlxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIEdFVChyZXF1ZXN0OiBOZXh0UmVxdWVzdCkge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBzZWFyY2hQYXJhbXMgPSByZXF1ZXN0Lm5leHRVcmwuc2VhcmNoUGFyYW1zXHJcbiAgICBjb25zdCBzZWFyY2ggPSBzZWFyY2hQYXJhbXMuZ2V0KFwic2VhcmNoXCIpXHJcblxyXG4gICAgbGV0IGl0ZW1zID0gYXdhaXQgZ2V0SW52ZW50b3J5SXRlbXMoKVxyXG5cclxuICAgIGlmIChzZWFyY2gpIHtcclxuICAgICAgY29uc3Qgc2VhcmNoTG93ZXIgPSBzZWFyY2gudG9Mb3dlckNhc2UoKVxyXG4gICAgICBpdGVtcyA9IGl0ZW1zLmZpbHRlcihcclxuICAgICAgICAoaXRlbSkgPT5cclxuICAgICAgICAgIGl0ZW0ubmFtZS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaExvd2VyKSB8fFxyXG4gICAgICAgICAgaXRlbS5za3UudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2hMb3dlcikgfHxcclxuICAgICAgICAgIGl0ZW0uY2F0ZWdvcnkudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2hMb3dlciksXHJcbiAgICAgIClcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oaXRlbXMpXHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoXCJbdjBdIEVycm9yIGZldGNoaW5nIGl0ZW1zOlwiLCBlcnJvcilcclxuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IGVycm9yOiBcIkZhaWxlZCB0byBmZXRjaCBpdGVtc1wiIH0sIHsgc3RhdHVzOiA1MDAgfSlcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBQT1NUKHJlcXVlc3Q6IE5leHRSZXF1ZXN0KSB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IGJvZHkgPSBhd2FpdCByZXF1ZXN0Lmpzb24oKVxyXG4gICAgY29uc3QgaXRlbSA9IGF3YWl0IGFkZEludmVudG9yeUl0ZW0oYm9keSlcclxuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbihpdGVtKVxyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKFwiW3YwXSBFcnJvciBjcmVhdGluZyBpdGVtOlwiLCBlcnJvcilcclxuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IGVycm9yOiBcIkZhaWxlZCB0byBjcmVhdGUgaXRlbVwiIH0sIHsgc3RhdHVzOiA1MDAgfSlcclxuICB9XHJcbn1cclxuIl0sIm5hbWVzIjpbIk5leHRSZXNwb25zZSIsImdldEludmVudG9yeUl0ZW1zIiwiYWRkSW52ZW50b3J5SXRlbSIsIkdFVCIsInJlcXVlc3QiLCJzZWFyY2hQYXJhbXMiLCJuZXh0VXJsIiwic2VhcmNoIiwiZ2V0IiwiaXRlbXMiLCJzZWFyY2hMb3dlciIsInRvTG93ZXJDYXNlIiwiZmlsdGVyIiwiaXRlbSIsIm5hbWUiLCJpbmNsdWRlcyIsInNrdSIsImNhdGVnb3J5IiwianNvbiIsImVycm9yIiwiY29uc29sZSIsInN0YXR1cyIsIlBPU1QiLCJib2R5Il0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./app/api/items/route.ts\n");

/***/ }),

/***/ "(rsc)/./lib/google-sheets.ts":
/*!******************************!*\
  !*** ./lib/google-sheets.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   addInventoryItem: () => (/* binding */ addInventoryItem),\n/* harmony export */   addTransaction: () => (/* binding */ addTransaction),\n/* harmony export */   deleteInventoryItem: () => (/* binding */ deleteInventoryItem),\n/* harmony export */   getGoogleSheetsClient: () => (/* binding */ getGoogleSheetsClient),\n/* harmony export */   getInventoryItems: () => (/* binding */ getInventoryItems),\n/* harmony export */   getTransactions: () => (/* binding */ getTransactions),\n/* harmony export */   updateInventoryItem: () => (/* binding */ updateInventoryItem)\n/* harmony export */ });\n/* harmony import */ var googleapis__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! googleapis */ \"(rsc)/./node_modules/.pnpm/googleapis@162.0.0/node_modules/googleapis/build/src/index.js\");\n\nconst SCOPES = [\n    \"https://www.googleapis.com/auth/spreadsheets\"\n];\nasync function getGoogleSheetsClient() {\n    const auth = new googleapis__WEBPACK_IMPORTED_MODULE_0__.google.auth.GoogleAuth({\n        credentials: {\n            client_email: process.env.GOOGLE_CLIENT_EMAIL,\n            private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\\\n/g, \"\\n\")\n        },\n        scopes: SCOPES\n    });\n    const sheets = googleapis__WEBPACK_IMPORTED_MODULE_0__.google.sheets({\n        version: \"v4\",\n        auth\n    });\n    return sheets;\n}\nasync function getInventoryItems() {\n    const sheets = await getGoogleSheetsClient();\n    const spreadsheetId = process.env.GOOGLE_SHEET_ID;\n    const response = await sheets.spreadsheets.values.get({\n        spreadsheetId,\n        range: \"Inventory!A2:J\"\n    });\n    const rows = response.data.values || [];\n    return rows.map((row)=>({\n            id: row[0] || \"\",\n            name: row[1] || \"\",\n            sku: row[2] || \"\",\n            category: row[3] || \"\",\n            quantity: Number.parseInt(row[4] || \"0\"),\n            costPrice: Number.parseFloat(row[5] || \"0\"),\n            sellingPrice: Number.parseFloat(row[6] || \"0\"),\n            reorderLevel: Number.parseInt(row[7] || \"0\"),\n            supplier: row[8] || \"\",\n            lastUpdated: row[9] || new Date().toISOString()\n        }));\n}\nasync function addInventoryItem(item) {\n    const sheets = await getGoogleSheetsClient();\n    const spreadsheetId = process.env.GOOGLE_SHEET_ID;\n    const id = `ITEM-${Date.now()}`;\n    const lastUpdated = new Date().toISOString();\n    const values = [\n        [\n            id,\n            item.name,\n            item.sku,\n            item.category,\n            item.quantity,\n            item.costPrice,\n            item.sellingPrice,\n            item.reorderLevel,\n            item.supplier,\n            lastUpdated\n        ]\n    ];\n    await sheets.spreadsheets.values.append({\n        spreadsheetId,\n        range: \"Inventory!A:J\",\n        valueInputOption: \"RAW\",\n        requestBody: {\n            values\n        }\n    });\n    return {\n        ...item,\n        id,\n        lastUpdated\n    };\n}\nasync function updateInventoryItem(id, updates) {\n    const sheets = await getGoogleSheetsClient();\n    const spreadsheetId = process.env.GOOGLE_SHEET_ID;\n    const items = await getInventoryItems();\n    const index = items.findIndex((item)=>item.id === id);\n    if (index === -1) {\n        throw new Error(\"Item not found\");\n    }\n    const item = {\n        ...items[index],\n        ...updates,\n        lastUpdated: new Date().toISOString()\n    };\n    const rowNumber = index + 2;\n    const values = [\n        [\n            item.id,\n            item.name,\n            item.sku,\n            item.category,\n            item.quantity,\n            item.costPrice,\n            item.sellingPrice,\n            item.reorderLevel,\n            item.supplier,\n            item.lastUpdated\n        ]\n    ];\n    await sheets.spreadsheets.values.update({\n        spreadsheetId,\n        range: `Inventory!A${rowNumber}:J${rowNumber}`,\n        valueInputOption: \"RAW\",\n        requestBody: {\n            values\n        }\n    });\n}\nasync function deleteInventoryItem(id) {\n    const sheets = await getGoogleSheetsClient();\n    const spreadsheetId = process.env.GOOGLE_SHEET_ID;\n    const items = await getInventoryItems();\n    const index = items.findIndex((item)=>item.id === id);\n    if (index === -1) {\n        throw new Error(\"Item not found\");\n    }\n    const rowNumber = index + 2;\n    await sheets.spreadsheets.batchUpdate({\n        spreadsheetId,\n        requestBody: {\n            requests: [\n                {\n                    deleteDimension: {\n                        range: {\n                            sheetId: 0,\n                            dimension: \"ROWS\",\n                            startIndex: rowNumber - 1,\n                            endIndex: rowNumber\n                        }\n                    }\n                }\n            ]\n        }\n    });\n}\nasync function addTransaction(transaction) {\n    const sheets = await getGoogleSheetsClient();\n    const spreadsheetId = process.env.GOOGLE_SHEET_ID;\n    const id = `TXN-${Date.now()}`;\n    const timestamp = new Date().toISOString();\n    const values = [\n        [\n            id,\n            transaction.itemId,\n            transaction.itemName,\n            transaction.quantity,\n            transaction.costPrice,\n            transaction.sellingPrice,\n            transaction.totalCost,\n            transaction.totalRevenue,\n            transaction.profit,\n            timestamp,\n            transaction.type\n        ]\n    ];\n    await sheets.spreadsheets.values.append({\n        spreadsheetId,\n        range: \"Transactions!A:K\",\n        valueInputOption: \"RAW\",\n        requestBody: {\n            values\n        }\n    });\n    return {\n        ...transaction,\n        id,\n        timestamp\n    };\n}\nasync function getTransactions() {\n    const sheets = await getGoogleSheetsClient();\n    const spreadsheetId = process.env.GOOGLE_SHEET_ID;\n    const response = await sheets.spreadsheets.values.get({\n        spreadsheetId,\n        range: \"Transactions!A2:K\"\n    });\n    const rows = response.data.values || [];\n    return rows.map((row)=>({\n            id: row[0] || \"\",\n            itemId: row[1] || \"\",\n            itemName: row[2] || \"\",\n            quantity: Number.parseInt(row[3] || \"0\"),\n            costPrice: Number.parseFloat(row[4] || \"0\"),\n            sellingPrice: Number.parseFloat(row[5] || \"0\"),\n            totalCost: Number.parseFloat(row[6] || \"0\"),\n            totalRevenue: Number.parseFloat(row[7] || \"0\"),\n            profit: Number.parseFloat(row[8] || \"0\"),\n            timestamp: row[9] || \"\",\n            type: row[10] || \"sale\"\n        }));\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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O1lBQ2R5QyxRQUFRekMsR0FBRyxDQUFDLEVBQUUsSUFBSTtZQUNsQjBDLFVBQVUxQyxHQUFHLENBQUMsRUFBRSxJQUFJO1lBQ3BCSyxVQUFVQyxPQUFPQyxRQUFRLENBQUNQLEdBQUcsQ0FBQyxFQUFFLElBQUk7WUFDcENRLFdBQVdGLE9BQU9HLFVBQVUsQ0FBQ1QsR0FBRyxDQUFDLEVBQUUsSUFBSTtZQUN2Q1UsY0FBY0osT0FBT0csVUFBVSxDQUFDVCxHQUFHLENBQUMsRUFBRSxJQUFJO1lBQzFDMkMsV0FBV3JDLE9BQU9HLFVBQVUsQ0FBQ1QsR0FBRyxDQUFDLEVBQUUsSUFBSTtZQUN2QzRDLGNBQWN0QyxPQUFPRyxVQUFVLENBQUNULEdBQUcsQ0FBQyxFQUFFLElBQUk7WUFDMUM2QyxRQUFRdkMsT0FBT0csVUFBVSxDQUFDVCxHQUFHLENBQUMsRUFBRSxJQUFJO1lBQ3BDd0MsV0FBV3hDLEdBQUcsQ0FBQyxFQUFFLElBQUk7WUFDckI4QyxNQUFPOUMsR0FBRyxDQUFDLEdBQUcsSUFBSTtRQUNwQjtBQUNGIiwic291cmNlcyI6WyJDOlxcVXNlcnNcXEFpemVuMDZcXERvY3VtZW50c1xcSW52ZW50b3J5LU1hbmFnZW1lbnQtU3lzdGVtXFxsaWJcXEludmVudG9yeS1NYW5hZ2VtZW50LVN5c3RlbVxcbGliXFxnb29nbGUtc2hlZXRzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGdvb2dsZSB9IGZyb20gXCJnb29nbGVhcGlzXCJcclxuaW1wb3J0IHR5cGUgeyBJbnZlbnRvcnlJdGVtLCBUcmFuc2FjdGlvbiB9IGZyb20gXCIuL3R5cGVzXCJcclxuXHJcbmNvbnN0IFNDT1BFUyA9IFtcImh0dHBzOi8vd3d3Lmdvb2dsZWFwaXMuY29tL2F1dGgvc3ByZWFkc2hlZXRzXCJdXHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0R29vZ2xlU2hlZXRzQ2xpZW50KCkge1xyXG4gIGNvbnN0IGF1dGggPSBuZXcgZ29vZ2xlLmF1dGguR29vZ2xlQXV0aCh7XHJcbiAgICBjcmVkZW50aWFsczoge1xyXG4gICAgICBjbGllbnRfZW1haWw6IHByb2Nlc3MuZW52LkdPT0dMRV9DTElFTlRfRU1BSUwsXHJcbiAgICAgIHByaXZhdGVfa2V5OiBwcm9jZXNzLmVudi5HT09HTEVfUFJJVkFURV9LRVk/LnJlcGxhY2UoL1xcXFxuL2csIFwiXFxuXCIpLFxyXG4gICAgfSxcclxuICAgIHNjb3BlczogU0NPUEVTLFxyXG4gIH0pXHJcblxyXG4gIGNvbnN0IHNoZWV0cyA9IGdvb2dsZS5zaGVldHMoeyB2ZXJzaW9uOiBcInY0XCIsIGF1dGggfSlcclxuICByZXR1cm4gc2hlZXRzXHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRJbnZlbnRvcnlJdGVtcygpOiBQcm9taXNlPEludmVudG9yeUl0ZW1bXT4ge1xyXG4gIGNvbnN0IHNoZWV0cyA9IGF3YWl0IGdldEdvb2dsZVNoZWV0c0NsaWVudCgpXHJcbiAgY29uc3Qgc3ByZWFkc2hlZXRJZCA9IHByb2Nlc3MuZW52LkdPT0dMRV9TSEVFVF9JRFxyXG5cclxuICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHNoZWV0cy5zcHJlYWRzaGVldHMudmFsdWVzLmdldCh7XHJcbiAgICBzcHJlYWRzaGVldElkLFxyXG4gICAgcmFuZ2U6IFwiSW52ZW50b3J5IUEyOkpcIixcclxuICB9KVxyXG5cclxuICBjb25zdCByb3dzID0gcmVzcG9uc2UuZGF0YS52YWx1ZXMgfHwgW11cclxuICByZXR1cm4gcm93cy5tYXAoKHJvdykgPT4gKHtcclxuICAgIGlkOiByb3dbMF0gfHwgXCJcIixcclxuICAgIG5hbWU6IHJvd1sxXSB8fCBcIlwiLFxyXG4gICAgc2t1OiByb3dbMl0gfHwgXCJcIixcclxuICAgIGNhdGVnb3J5OiByb3dbM10gfHwgXCJcIixcclxuICAgIHF1YW50aXR5OiBOdW1iZXIucGFyc2VJbnQocm93WzRdIHx8IFwiMFwiKSxcclxuICAgIGNvc3RQcmljZTogTnVtYmVyLnBhcnNlRmxvYXQocm93WzVdIHx8IFwiMFwiKSxcclxuICAgIHNlbGxpbmdQcmljZTogTnVtYmVyLnBhcnNlRmxvYXQocm93WzZdIHx8IFwiMFwiKSxcclxuICAgIHJlb3JkZXJMZXZlbDogTnVtYmVyLnBhcnNlSW50KHJvd1s3XSB8fCBcIjBcIiksXHJcbiAgICBzdXBwbGllcjogcm93WzhdIHx8IFwiXCIsXHJcbiAgICBsYXN0VXBkYXRlZDogcm93WzldIHx8IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcclxuICB9KSlcclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGFkZEludmVudG9yeUl0ZW0oaXRlbTogT21pdDxJbnZlbnRvcnlJdGVtLCBcImlkXCIgfCBcImxhc3RVcGRhdGVkXCI+KTogUHJvbWlzZTxJbnZlbnRvcnlJdGVtPiB7XHJcbiAgY29uc3Qgc2hlZXRzID0gYXdhaXQgZ2V0R29vZ2xlU2hlZXRzQ2xpZW50KClcclxuICBjb25zdCBzcHJlYWRzaGVldElkID0gcHJvY2Vzcy5lbnYuR09PR0xFX1NIRUVUX0lEXHJcblxyXG4gIGNvbnN0IGlkID0gYElURU0tJHtEYXRlLm5vdygpfWBcclxuICBjb25zdCBsYXN0VXBkYXRlZCA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxyXG5cclxuICBjb25zdCB2YWx1ZXMgPSBbXHJcbiAgICBbXHJcbiAgICAgIGlkLFxyXG4gICAgICBpdGVtLm5hbWUsXHJcbiAgICAgIGl0ZW0uc2t1LFxyXG4gICAgICBpdGVtLmNhdGVnb3J5LFxyXG4gICAgICBpdGVtLnF1YW50aXR5LFxyXG4gICAgICBpdGVtLmNvc3RQcmljZSxcclxuICAgICAgaXRlbS5zZWxsaW5nUHJpY2UsXHJcbiAgICAgIGl0ZW0ucmVvcmRlckxldmVsLFxyXG4gICAgICBpdGVtLnN1cHBsaWVyLFxyXG4gICAgICBsYXN0VXBkYXRlZCxcclxuICAgIF0sXHJcbiAgXVxyXG5cclxuICBhd2FpdCBzaGVldHMuc3ByZWFkc2hlZXRzLnZhbHVlcy5hcHBlbmQoe1xyXG4gICAgc3ByZWFkc2hlZXRJZCxcclxuICAgIHJhbmdlOiBcIkludmVudG9yeSFBOkpcIixcclxuICAgIHZhbHVlSW5wdXRPcHRpb246IFwiUkFXXCIsXHJcbiAgICByZXF1ZXN0Qm9keTogeyB2YWx1ZXMgfSxcclxuICB9KVxyXG5cclxuICByZXR1cm4geyAuLi5pdGVtLCBpZCwgbGFzdFVwZGF0ZWQgfVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdXBkYXRlSW52ZW50b3J5SXRlbShpZDogc3RyaW5nLCB1cGRhdGVzOiBQYXJ0aWFsPEludmVudG9yeUl0ZW0+KTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgY29uc3Qgc2hlZXRzID0gYXdhaXQgZ2V0R29vZ2xlU2hlZXRzQ2xpZW50KClcclxuICBjb25zdCBzcHJlYWRzaGVldElkID0gcHJvY2Vzcy5lbnYuR09PR0xFX1NIRUVUX0lEXHJcblxyXG4gIGNvbnN0IGl0ZW1zID0gYXdhaXQgZ2V0SW52ZW50b3J5SXRlbXMoKVxyXG4gIGNvbnN0IGluZGV4ID0gaXRlbXMuZmluZEluZGV4KChpdGVtKSA9PiBpdGVtLmlkID09PSBpZClcclxuXHJcbiAgaWYgKGluZGV4ID09PSAtMSkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKFwiSXRlbSBub3QgZm91bmRcIilcclxuICB9XHJcblxyXG4gIGNvbnN0IGl0ZW0gPSB7IC4uLml0ZW1zW2luZGV4XSwgLi4udXBkYXRlcywgbGFzdFVwZGF0ZWQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSB9XHJcbiAgY29uc3Qgcm93TnVtYmVyID0gaW5kZXggKyAyXHJcblxyXG4gIGNvbnN0IHZhbHVlcyA9IFtcclxuICAgIFtcclxuICAgICAgaXRlbS5pZCxcclxuICAgICAgaXRlbS5uYW1lLFxyXG4gICAgICBpdGVtLnNrdSxcclxuICAgICAgaXRlbS5jYXRlZ29yeSxcclxuICAgICAgaXRlbS5xdWFudGl0eSxcclxuICAgICAgaXRlbS5jb3N0UHJpY2UsXHJcbiAgICAgIGl0ZW0uc2VsbGluZ1ByaWNlLFxyXG4gICAgICBpdGVtLnJlb3JkZXJMZXZlbCxcclxuICAgICAgaXRlbS5zdXBwbGllcixcclxuICAgICAgaXRlbS5sYXN0VXBkYXRlZCxcclxuICAgIF0sXHJcbiAgXVxyXG5cclxuICBhd2FpdCBzaGVldHMuc3ByZWFkc2hlZXRzLnZhbHVlcy51cGRhdGUoe1xyXG4gICAgc3ByZWFkc2hlZXRJZCxcclxuICAgIHJhbmdlOiBgSW52ZW50b3J5IUEke3Jvd051bWJlcn06SiR7cm93TnVtYmVyfWAsXHJcbiAgICB2YWx1ZUlucHV0T3B0aW9uOiBcIlJBV1wiLFxyXG4gICAgcmVxdWVzdEJvZHk6IHsgdmFsdWVzIH0sXHJcbiAgfSlcclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRlbGV0ZUludmVudG9yeUl0ZW0oaWQ6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xyXG4gIGNvbnN0IHNoZWV0cyA9IGF3YWl0IGdldEdvb2dsZVNoZWV0c0NsaWVudCgpXHJcbiAgY29uc3Qgc3ByZWFkc2hlZXRJZCA9IHByb2Nlc3MuZW52LkdPT0dMRV9TSEVFVF9JRFxyXG5cclxuICBjb25zdCBpdGVtcyA9IGF3YWl0IGdldEludmVudG9yeUl0ZW1zKClcclxuICBjb25zdCBpbmRleCA9IGl0ZW1zLmZpbmRJbmRleCgoaXRlbSkgPT4gaXRlbS5pZCA9PT0gaWQpXHJcblxyXG4gIGlmIChpbmRleCA9PT0gLTEpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcihcIkl0ZW0gbm90IGZvdW5kXCIpXHJcbiAgfVxyXG5cclxuICBjb25zdCByb3dOdW1iZXIgPSBpbmRleCArIDJcclxuXHJcbiAgYXdhaXQgc2hlZXRzLnNwcmVhZHNoZWV0cy5iYXRjaFVwZGF0ZSh7XHJcbiAgICBzcHJlYWRzaGVldElkLFxyXG4gICAgcmVxdWVzdEJvZHk6IHtcclxuICAgICAgcmVxdWVzdHM6IFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBkZWxldGVEaW1lbnNpb246IHtcclxuICAgICAgICAgICAgcmFuZ2U6IHtcclxuICAgICAgICAgICAgICBzaGVldElkOiAwLFxyXG4gICAgICAgICAgICAgIGRpbWVuc2lvbjogXCJST1dTXCIsXHJcbiAgICAgICAgICAgICAgc3RhcnRJbmRleDogcm93TnVtYmVyIC0gMSxcclxuICAgICAgICAgICAgICBlbmRJbmRleDogcm93TnVtYmVyLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9LFxyXG4gICAgICBdLFxyXG4gICAgfSxcclxuICB9KVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYWRkVHJhbnNhY3Rpb24odHJhbnNhY3Rpb246IE9taXQ8VHJhbnNhY3Rpb24sIFwiaWRcIiB8IFwidGltZXN0YW1wXCI+KTogUHJvbWlzZTxUcmFuc2FjdGlvbj4ge1xyXG4gIGNvbnN0IHNoZWV0cyA9IGF3YWl0IGdldEdvb2dsZVNoZWV0c0NsaWVudCgpXHJcbiAgY29uc3Qgc3ByZWFkc2hlZXRJZCA9IHByb2Nlc3MuZW52LkdPT0dMRV9TSEVFVF9JRFxyXG5cclxuICBjb25zdCBpZCA9IGBUWE4tJHtEYXRlLm5vdygpfWBcclxuICBjb25zdCB0aW1lc3RhbXAgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcclxuXHJcbiAgY29uc3QgdmFsdWVzID0gW1xyXG4gICAgW1xyXG4gICAgICBpZCxcclxuICAgICAgdHJhbnNhY3Rpb24uaXRlbUlkLFxyXG4gICAgICB0cmFuc2FjdGlvbi5pdGVtTmFtZSxcclxuICAgICAgdHJhbnNhY3Rpb24ucXVhbnRpdHksXHJcbiAgICAgIHRyYW5zYWN0aW9uLmNvc3RQcmljZSxcclxuICAgICAgdHJhbnNhY3Rpb24uc2VsbGluZ1ByaWNlLFxyXG4gICAgICB0cmFuc2FjdGlvbi50b3RhbENvc3QsXHJcbiAgICAgIHRyYW5zYWN0aW9uLnRvdGFsUmV2ZW51ZSxcclxuICAgICAgdHJhbnNhY3Rpb24ucHJvZml0LFxyXG4gICAgICB0aW1lc3RhbXAsXHJcbiAgICAgIHRyYW5zYWN0aW9uLnR5cGUsXHJcbiAgICBdLFxyXG4gIF1cclxuXHJcbiAgYXdhaXQgc2hlZXRzLnNwcmVhZHNoZWV0cy52YWx1ZXMuYXBwZW5kKHtcclxuICAgIHNwcmVhZHNoZWV0SWQsXHJcbiAgICByYW5nZTogXCJUcmFuc2FjdGlvbnMhQTpLXCIsXHJcbiAgICB2YWx1ZUlucHV0T3B0aW9uOiBcIlJBV1wiLFxyXG4gICAgcmVxdWVzdEJvZHk6IHsgdmFsdWVzIH0sXHJcbiAgfSlcclxuXHJcbiAgcmV0dXJuIHsgLi4udHJhbnNhY3Rpb24sIGlkLCB0aW1lc3RhbXAgfVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0VHJhbnNhY3Rpb25zKCk6IFByb21pc2U8VHJhbnNhY3Rpb25bXT4ge1xyXG4gIGNvbnN0IHNoZWV0cyA9IGF3YWl0IGdldEdvb2dsZVNoZWV0c0NsaWVudCgpXHJcbiAgY29uc3Qgc3ByZWFkc2hlZXRJZCA9IHByb2Nlc3MuZW52LkdPT0dMRV9TSEVFVF9JRFxyXG5cclxuICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHNoZWV0cy5zcHJlYWRzaGVldHMudmFsdWVzLmdldCh7XHJcbiAgICBzcHJlYWRzaGVldElkLFxyXG4gICAgcmFuZ2U6IFwiVHJhbnNhY3Rpb25zIUEyOktcIixcclxuICB9KVxyXG5cclxuICBjb25zdCByb3dzID0gcmVzcG9uc2UuZGF0YS52YWx1ZXMgfHwgW11cclxuICByZXR1cm4gcm93cy5tYXAoKHJvdykgPT4gKHtcclxuICAgIGlkOiByb3dbMF0gfHwgXCJcIixcclxuICAgIGl0ZW1JZDogcm93WzFdIHx8IFwiXCIsXHJcbiAgICBpdGVtTmFtZTogcm93WzJdIHx8IFwiXCIsXHJcbiAgICBxdWFudGl0eTogTnVtYmVyLnBhcnNlSW50KHJvd1szXSB8fCBcIjBcIiksXHJcbiAgICBjb3N0UHJpY2U6IE51bWJlci5wYXJzZUZsb2F0KHJvd1s0XSB8fCBcIjBcIiksXHJcbiAgICBzZWxsaW5nUHJpY2U6IE51bWJlci5wYXJzZUZsb2F0KHJvd1s1XSB8fCBcIjBcIiksXHJcbiAgICB0b3RhbENvc3Q6IE51bWJlci5wYXJzZUZsb2F0KHJvd1s2XSB8fCBcIjBcIiksXHJcbiAgICB0b3RhbFJldmVudWU6IE51bWJlci5wYXJzZUZsb2F0KHJvd1s3XSB8fCBcIjBcIiksXHJcbiAgICBwcm9maXQ6IE51bWJlci5wYXJzZUZsb2F0KHJvd1s4XSB8fCBcIjBcIiksXHJcbiAgICB0aW1lc3RhbXA6IHJvd1s5XSB8fCBcIlwiLFxyXG4gICAgdHlwZTogKHJvd1sxMF0gfHwgXCJzYWxlXCIpIGFzIFwic2FsZVwiIHwgXCJyZXN0b2NrXCIsXHJcbiAgfSkpXHJcbn1cclxuIl0sIm5hbWVzIjpbImdvb2dsZSIsIlNDT1BFUyIsImdldEdvb2dsZVNoZWV0c0NsaWVudCIsImF1dGgiLCJHb29nbGVBdXRoIiwiY3JlZGVudGlhbHMiLCJjbGllbnRfZW1haWwiLCJwcm9jZXNzIiwiZW52IiwiR09PR0xFX0NMSUVOVF9FTUFJTCIsInByaXZhdGVfa2V5IiwiR09PR0xFX1BSSVZBVEVfS0VZIiwicmVwbGFjZSIsInNjb3BlcyIsInNoZWV0cyIsInZlcnNpb24iLCJnZXRJbnZlbnRvcnlJdGVtcyIsInNwcmVhZHNoZWV0SWQiLCJHT09HTEVfU0hFRVRfSUQiLCJyZXNwb25zZSIsInNwcmVhZHNoZWV0cyIsInZhbHVlcyIsImdldCIsInJhbmdlIiwicm93cyIsImRhdGEiLCJtYXAiLCJyb3ciLCJpZCIsIm5hbWUiLCJza3UiLCJjYXRlZ29yeSIsInF1YW50aXR5IiwiTnVtYmVyIiwicGFyc2VJbnQiLCJjb3N0UHJpY2UiLCJwYXJzZUZsb2F0Iiwic2VsbGluZ1ByaWNlIiwicmVvcmRlckxldmVsIiwic3VwcGxpZXIiLCJsYXN0VXBkYXRlZCIsIkRhdGUiLCJ0b0lTT1N0cmluZyIsImFkZEludmVudG9yeUl0ZW0iLCJpdGVtIiwibm93IiwiYXBwZW5kIiwidmFsdWVJbnB1dE9wdGlvbiIsInJlcXVlc3RCb2R5IiwidXBkYXRlSW52ZW50b3J5SXRlbSIsInVwZGF0ZXMiLCJpdGVtcyIsImluZGV4IiwiZmluZEluZGV4IiwiRXJyb3IiLCJyb3dOdW1iZXIiLCJ1cGRhdGUiLCJkZWxldGVJbnZlbnRvcnlJdGVtIiwiYmF0Y2hVcGRhdGUiLCJyZXF1ZXN0cyIsImRlbGV0ZURpbWVuc2lvbiIsInNoZWV0SWQiLCJkaW1lbnNpb24iLCJzdGFydEluZGV4IiwiZW5kSW5kZXgiLCJhZGRUcmFuc2FjdGlvbiIsInRyYW5zYWN0aW9uIiwidGltZXN0YW1wIiwiaXRlbUlkIiwiaXRlbU5hbWUiLCJ0b3RhbENvc3QiLCJ0b3RhbFJldmVudWUiLCJwcm9maXQiLCJ0eXBlIiwiZ2V0VHJhbnNhY3Rpb25zIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./lib/google-sheets.ts\n");

/***/ }),

/***/ "(rsc)/./node_modules/.pnpm/next@15.2.4_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fitems%2Froute&page=%2Fapi%2Fitems%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fitems%2Froute.ts&appDir=C%3A%5CUsers%5CAizen06%5CDocuments%5CInventory-Management-System%5Clib%5CInventory-Management-System%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CAizen06%5CDocuments%5CInventory-Management-System%5Clib%5CInventory-Management-System&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/.pnpm/next@15.2.4_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fitems%2Froute&page=%2Fapi%2Fitems%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fitems%2Froute.ts&appDir=C%3A%5CUsers%5CAizen06%5CDocuments%5CInventory-Management-System%5Clib%5CInventory-Management-System%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CAizen06%5CDocuments%5CInventory-Management-System%5Clib%5CInventory-Management-System&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/.pnpm/next@15.2.4_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/./node_modules/.pnpm/next@15.2.4_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/.pnpm/next@15.2.4_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var C_Users_Aizen06_Documents_Inventory_Management_System_lib_Inventory_Management_System_app_api_items_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/items/route.ts */ \"(rsc)/./app/api/items/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/items/route\",\n        pathname: \"/api/items\",\n        filename: \"route\",\n        bundlePath: \"app/api/items/route\"\n    },\n    resolvedPagePath: \"C:\\\\Users\\\\Aizen06\\\\Documents\\\\Inventory-Management-System\\\\lib\\\\Inventory-Management-System\\\\app\\\\api\\\\items\\\\route.ts\",\n    nextConfigOutput,\n    userland: C_Users_Aizen06_Documents_Inventory_Management_System_lib_Inventory_Management_System_app_api_items_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        workAsyncStorage,\n        workUnitAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvLnBucG0vbmV4dEAxNS4yLjRfcmVhY3QtZG9tQDE5LjIuMF9yZWFjdEAxOS4yLjBfX3JlYWN0QDE5LjIuMC9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIvaW5kZXguanM/bmFtZT1hcHAlMkZhcGklMkZpdGVtcyUyRnJvdXRlJnBhZ2U9JTJGYXBpJTJGaXRlbXMlMkZyb3V0ZSZhcHBQYXRocz0mcGFnZVBhdGg9cHJpdmF0ZS1uZXh0LWFwcC1kaXIlMkZhcGklMkZpdGVtcyUyRnJvdXRlLnRzJmFwcERpcj1DJTNBJTVDVXNlcnMlNUNBaXplbjA2JTVDRG9jdW1lbnRzJTVDSW52ZW50b3J5LU1hbmFnZW1lbnQtU3lzdGVtJTVDbGliJTVDSW52ZW50b3J5LU1hbmFnZW1lbnQtU3lzdGVtJTVDYXBwJnBhZ2VFeHRlbnNpb25zPXRzeCZwYWdlRXh0ZW5zaW9ucz10cyZwYWdlRXh0ZW5zaW9ucz1qc3gmcGFnZUV4dGVuc2lvbnM9anMmcm9vdERpcj1DJTNBJTVDVXNlcnMlNUNBaXplbjA2JTVDRG9jdW1lbnRzJTVDSW52ZW50b3J5LU1hbmFnZW1lbnQtU3lzdGVtJTVDbGliJTVDSW52ZW50b3J5LU1hbmFnZW1lbnQtU3lzdGVtJmlzRGV2PXRydWUmdHNjb25maWdQYXRoPXRzY29uZmlnLmpzb24mYmFzZVBhdGg9JmFzc2V0UHJlZml4PSZuZXh0Q29uZmlnT3V0cHV0PSZwcmVmZXJyZWRSZWdpb249Jm1pZGRsZXdhcmVDb25maWc9ZTMwJTNEISIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUErRjtBQUN2QztBQUNxQjtBQUN1RTtBQUNwSjtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IseUdBQW1CO0FBQzNDO0FBQ0EsY0FBYyxrRUFBUztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsWUFBWTtBQUNaLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQSxRQUFRLHNEQUFzRDtBQUM5RDtBQUNBLFdBQVcsNEVBQVc7QUFDdEI7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUMwRjs7QUFFMUYiLCJzb3VyY2VzIjpbIiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHBSb3V0ZVJvdXRlTW9kdWxlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvcm91dGUtbW9kdWxlcy9hcHAtcm91dGUvbW9kdWxlLmNvbXBpbGVkXCI7XG5pbXBvcnQgeyBSb3V0ZUtpbmQgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9yb3V0ZS1raW5kXCI7XG5pbXBvcnQgeyBwYXRjaEZldGNoIGFzIF9wYXRjaEZldGNoIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvbGliL3BhdGNoLWZldGNoXCI7XG5pbXBvcnQgKiBhcyB1c2VybGFuZCBmcm9tIFwiQzpcXFxcVXNlcnNcXFxcQWl6ZW4wNlxcXFxEb2N1bWVudHNcXFxcSW52ZW50b3J5LU1hbmFnZW1lbnQtU3lzdGVtXFxcXGxpYlxcXFxJbnZlbnRvcnktTWFuYWdlbWVudC1TeXN0ZW1cXFxcYXBwXFxcXGFwaVxcXFxpdGVtc1xcXFxyb3V0ZS50c1wiO1xuLy8gV2UgaW5qZWN0IHRoZSBuZXh0Q29uZmlnT3V0cHV0IGhlcmUgc28gdGhhdCB3ZSBjYW4gdXNlIHRoZW0gaW4gdGhlIHJvdXRlXG4vLyBtb2R1bGUuXG5jb25zdCBuZXh0Q29uZmlnT3V0cHV0ID0gXCJcIlxuY29uc3Qgcm91dGVNb2R1bGUgPSBuZXcgQXBwUm91dGVSb3V0ZU1vZHVsZSh7XG4gICAgZGVmaW5pdGlvbjoge1xuICAgICAgICBraW5kOiBSb3V0ZUtpbmQuQVBQX1JPVVRFLFxuICAgICAgICBwYWdlOiBcIi9hcGkvaXRlbXMvcm91dGVcIixcbiAgICAgICAgcGF0aG5hbWU6IFwiL2FwaS9pdGVtc1wiLFxuICAgICAgICBmaWxlbmFtZTogXCJyb3V0ZVwiLFxuICAgICAgICBidW5kbGVQYXRoOiBcImFwcC9hcGkvaXRlbXMvcm91dGVcIlxuICAgIH0sXG4gICAgcmVzb2x2ZWRQYWdlUGF0aDogXCJDOlxcXFxVc2Vyc1xcXFxBaXplbjA2XFxcXERvY3VtZW50c1xcXFxJbnZlbnRvcnktTWFuYWdlbWVudC1TeXN0ZW1cXFxcbGliXFxcXEludmVudG9yeS1NYW5hZ2VtZW50LVN5c3RlbVxcXFxhcHBcXFxcYXBpXFxcXGl0ZW1zXFxcXHJvdXRlLnRzXCIsXG4gICAgbmV4dENvbmZpZ091dHB1dCxcbiAgICB1c2VybGFuZFxufSk7XG4vLyBQdWxsIG91dCB0aGUgZXhwb3J0cyB0aGF0IHdlIG5lZWQgdG8gZXhwb3NlIGZyb20gdGhlIG1vZHVsZS4gVGhpcyBzaG91bGRcbi8vIGJlIGVsaW1pbmF0ZWQgd2hlbiB3ZSd2ZSBtb3ZlZCB0aGUgb3RoZXIgcm91dGVzIHRvIHRoZSBuZXcgZm9ybWF0LiBUaGVzZVxuLy8gYXJlIHVzZWQgdG8gaG9vayBpbnRvIHRoZSByb3V0ZS5cbmNvbnN0IHsgd29ya0FzeW5jU3RvcmFnZSwgd29ya1VuaXRBc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzIH0gPSByb3V0ZU1vZHVsZTtcbmZ1bmN0aW9uIHBhdGNoRmV0Y2goKSB7XG4gICAgcmV0dXJuIF9wYXRjaEZldGNoKHtcbiAgICAgICAgd29ya0FzeW5jU3RvcmFnZSxcbiAgICAgICAgd29ya1VuaXRBc3luY1N0b3JhZ2VcbiAgICB9KTtcbn1cbmV4cG9ydCB7IHJvdXRlTW9kdWxlLCB3b3JrQXN5bmNTdG9yYWdlLCB3b3JrVW5pdEFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MsIHBhdGNoRmV0Y2gsICB9O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1hcHAtcm91dGUuanMubWFwIl0sIm5hbWVzIjpbXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/.pnpm/next@15.2.4_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fitems%2Froute&page=%2Fapi%2Fitems%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fitems%2Froute.ts&appDir=C%3A%5CUsers%5CAizen06%5CDocuments%5CInventory-Management-System%5Clib%5CInventory-Management-System%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CAizen06%5CDocuments%5CInventory-Management-System%5Clib%5CInventory-Management-System&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./node_modules/.pnpm/next@15.2.4_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!*********************************************************************************************************************************************************************************!*\
  !*** ./node_modules/.pnpm/next@15.2.4_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \*********************************************************************************************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "(ssr)/./node_modules/.pnpm/next@15.2.4_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!*********************************************************************************************************************************************************************************!*\
  !*** ./node_modules/.pnpm/next@15.2.4_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \*********************************************************************************************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "../app-render/after-task-async-storage.external":
/*!***********************************************************************************!*\
  !*** external "next/dist/server/app-render/after-task-async-storage.external.js" ***!
  \***********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/after-task-async-storage.external.js");

/***/ }),

/***/ "../app-render/work-async-storage.external":
/*!*****************************************************************************!*\
  !*** external "next/dist/server/app-render/work-async-storage.external.js" ***!
  \*****************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-async-storage.external.js");

/***/ }),

/***/ "./work-unit-async-storage.external":
/*!**********************************************************************************!*\
  !*** external "next/dist/server/app-render/work-unit-async-storage.external.js" ***!
  \**********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-unit-async-storage.external.js");

/***/ }),

/***/ "assert":
/*!*************************!*\
  !*** external "assert" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("assert");

/***/ }),

/***/ "buffer":
/*!*************************!*\
  !*** external "buffer" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("buffer");

/***/ }),

/***/ "child_process":
/*!********************************!*\
  !*** external "child_process" ***!
  \********************************/
/***/ ((module) => {

"use strict";
module.exports = require("child_process");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("crypto");

/***/ }),

/***/ "events":
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("events");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("http");

/***/ }),

/***/ "http2":
/*!************************!*\
  !*** external "http2" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("http2");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("https");

/***/ }),

/***/ "net":
/*!**********************!*\
  !*** external "net" ***!
  \**********************/
/***/ ((module) => {

"use strict";
module.exports = require("net");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "node:buffer":
/*!******************************!*\
  !*** external "node:buffer" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:buffer");

/***/ }),

/***/ "node:fs":
/*!**************************!*\
  !*** external "node:fs" ***!
  \**************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:fs");

/***/ }),

/***/ "node:http":
/*!****************************!*\
  !*** external "node:http" ***!
  \****************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:http");

/***/ }),

/***/ "node:https":
/*!*****************************!*\
  !*** external "node:https" ***!
  \*****************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:https");

/***/ }),

/***/ "node:net":
/*!***************************!*\
  !*** external "node:net" ***!
  \***************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:net");

/***/ }),

/***/ "node:path":
/*!****************************!*\
  !*** external "node:path" ***!
  \****************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:path");

/***/ }),

/***/ "node:process":
/*!*******************************!*\
  !*** external "node:process" ***!
  \*******************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:process");

/***/ }),

/***/ "node:stream":
/*!******************************!*\
  !*** external "node:stream" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:stream");

/***/ }),

/***/ "node:stream/web":
/*!**********************************!*\
  !*** external "node:stream/web" ***!
  \**********************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:stream/web");

/***/ }),

/***/ "node:url":
/*!***************************!*\
  !*** external "node:url" ***!
  \***************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:url");

/***/ }),

/***/ "node:util":
/*!****************************!*\
  !*** external "node:util" ***!
  \****************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:util");

/***/ }),

/***/ "node:zlib":
/*!****************************!*\
  !*** external "node:zlib" ***!
  \****************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:zlib");

/***/ }),

/***/ "os":
/*!*********************!*\
  !*** external "os" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("os");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ }),

/***/ "process":
/*!**************************!*\
  !*** external "process" ***!
  \**************************/
/***/ ((module) => {

"use strict";
module.exports = require("process");

/***/ }),

/***/ "querystring":
/*!******************************!*\
  !*** external "querystring" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = require("querystring");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("stream");

/***/ }),

/***/ "tls":
/*!**********************!*\
  !*** external "tls" ***!
  \**********************/
/***/ ((module) => {

"use strict";
module.exports = require("tls");

/***/ }),

/***/ "tty":
/*!**********************!*\
  !*** external "tty" ***!
  \**********************/
/***/ ((module) => {

"use strict";
module.exports = require("tty");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/***/ ((module) => {

"use strict";
module.exports = require("url");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("util");

/***/ }),

/***/ "worker_threads":
/*!*********************************!*\
  !*** external "worker_threads" ***!
  \*********************************/
/***/ ((module) => {

"use strict";
module.exports = require("worker_threads");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("zlib");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next@15.2.4_react-dom@19.2.0_react@19.2.0__react@19.2.0","vendor-chunks/googleapis@162.0.0","vendor-chunks/google-auth-library@10.4.0","vendor-chunks/bignumber.js@9.3.1","vendor-chunks/googleapis-common@8.0.0","vendor-chunks/gaxios@7.1.2","vendor-chunks/qs@6.14.0","vendor-chunks/json-bigint@1.0.0","vendor-chunks/gtoken@8.0.0","vendor-chunks/google-logging-utils@1.1.1","vendor-chunks/gcp-metadata@7.0.1","vendor-chunks/object-inspect@1.13.4","vendor-chunks/get-intrinsic@1.3.0","vendor-chunks/jws@4.0.0","vendor-chunks/jwa@2.0.1","vendor-chunks/url-template@2.0.8","vendor-chunks/ecdsa-sig-formatter@1.0.11","vendor-chunks/base64-js@1.5.1","vendor-chunks/side-channel-list@1.0.0","vendor-chunks/extend@3.0.2","vendor-chunks/side-channel-weakmap@1.0.2","vendor-chunks/has-symbols@1.1.0","vendor-chunks/function-bind@1.1.2","vendor-chunks/side-channel-map@1.0.1","vendor-chunks/safe-buffer@5.2.1","vendor-chunks/side-channel@1.1.0","vendor-chunks/get-proto@1.0.1","vendor-chunks/call-bind-apply-helpers@1.0.2","vendor-chunks/buffer-equal-constant-time@1.0.1","vendor-chunks/dunder-proto@1.0.1","vendor-chunks/math-intrinsics@1.1.0","vendor-chunks/call-bound@1.0.4","vendor-chunks/es-errors@1.3.0","vendor-chunks/gopd@1.2.0","vendor-chunks/es-define-property@1.0.1","vendor-chunks/hasown@2.0.2","vendor-chunks/es-object-atoms@1.1.1"], () => (__webpack_exec__("(rsc)/./node_modules/.pnpm/next@15.2.4_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fitems%2Froute&page=%2Fapi%2Fitems%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fitems%2Froute.ts&appDir=C%3A%5CUsers%5CAizen06%5CDocuments%5CInventory-Management-System%5Clib%5CInventory-Management-System%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CAizen06%5CDocuments%5CInventory-Management-System%5Clib%5CInventory-Management-System&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();