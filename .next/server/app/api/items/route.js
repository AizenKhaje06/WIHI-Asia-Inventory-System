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
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET),\n/* harmony export */   POST: () => (/* binding */ POST)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var _lib_google_sheets__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/lib/google-sheets */ \"(rsc)/./lib/google-sheets.ts\");\n\n\nasync function GET(request) {\n    try {\n        const searchParams = request.nextUrl.searchParams;\n        const search = searchParams.get(\"search\");\n        let items = await (0,_lib_google_sheets__WEBPACK_IMPORTED_MODULE_1__.getInventoryItems)();\n        if (search) {\n            const searchLower = search.toLowerCase();\n            items = items.filter((item)=>item.name.toLowerCase().includes(searchLower) || item.sku.toLowerCase().includes(searchLower) || item.category.toLowerCase().includes(searchLower));\n        }\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json(items);\n    } catch (error) {\n        console.error(\"[v0] Error fetching items:\", error);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: \"Failed to fetch items\"\n        }, {\n            status: 500\n        });\n    }\n}\nasync function POST(request) {\n    try {\n        const body = await request.json();\n        const item = await (0,_lib_google_sheets__WEBPACK_IMPORTED_MODULE_1__.addInventoryItem)(body);\n        await (0,_lib_google_sheets__WEBPACK_IMPORTED_MODULE_1__.addLog)({\n            operation: \"create\",\n            itemId: item.id,\n            itemName: item.name,\n            details: `Added \"${item.name}\" (SKU: ${item.sku}) - Qty: ${item.quantity}, Cost: ₱${item.costPrice.toFixed(2)}, Sell: ₱${item.sellingPrice.toFixed(2)}`\n        });\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json(item);\n    } catch (error) {\n        console.error(\"[v0] Error creating item:\", error);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: \"Failed to create item\"\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2l0ZW1zL3JvdXRlLnRzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBNEQ7QUFDcUI7QUFFMUUsZUFBZUksSUFBSUMsT0FBb0I7SUFDNUMsSUFBSTtRQUNGLE1BQU1DLGVBQWVELFFBQVFFLE9BQU8sQ0FBQ0QsWUFBWTtRQUNqRCxNQUFNRSxTQUFTRixhQUFhRyxHQUFHLENBQUM7UUFFaEMsSUFBSUMsUUFBUSxNQUFNVCxxRUFBaUJBO1FBRW5DLElBQUlPLFFBQVE7WUFDVixNQUFNRyxjQUFjSCxPQUFPSSxXQUFXO1lBQ3RDRixRQUFRQSxNQUFNRyxNQUFNLENBQ2xCLENBQUNDLE9BQ0NBLEtBQUtDLElBQUksQ0FBQ0gsV0FBVyxHQUFHSSxRQUFRLENBQUNMLGdCQUNqQ0csS0FBS0csR0FBRyxDQUFDTCxXQUFXLEdBQUdJLFFBQVEsQ0FBQ0wsZ0JBQ2hDRyxLQUFLSSxRQUFRLENBQUNOLFdBQVcsR0FBR0ksUUFBUSxDQUFDTDtRQUUzQztRQUVBLE9BQU9YLHFEQUFZQSxDQUFDbUIsSUFBSSxDQUFDVDtJQUMzQixFQUFFLE9BQU9VLE9BQU87UUFDZEMsUUFBUUQsS0FBSyxDQUFDLDhCQUE4QkE7UUFDNUMsT0FBT3BCLHFEQUFZQSxDQUFDbUIsSUFBSSxDQUFDO1lBQUVDLE9BQU87UUFBd0IsR0FBRztZQUFFRSxRQUFRO1FBQUk7SUFDN0U7QUFDRjtBQUVPLGVBQWVDLEtBQUtsQixPQUFvQjtJQUM3QyxJQUFJO1FBQ0YsTUFBTW1CLE9BQU8sTUFBTW5CLFFBQVFjLElBQUk7UUFDL0IsTUFBTUwsT0FBTyxNQUFNWixvRUFBZ0JBLENBQUNzQjtRQUNwQyxNQUFNckIsMERBQU1BLENBQUM7WUFDWHNCLFdBQVc7WUFDWEMsUUFBUVosS0FBS2EsRUFBRTtZQUNmQyxVQUFVZCxLQUFLQyxJQUFJO1lBQ25CYyxTQUFTLENBQUMsT0FBTyxFQUFFZixLQUFLQyxJQUFJLENBQUMsUUFBUSxFQUFFRCxLQUFLRyxHQUFHLENBQUMsU0FBUyxFQUFFSCxLQUFLZ0IsUUFBUSxDQUFDLFNBQVMsRUFBRWhCLEtBQUtpQixTQUFTLENBQUNDLE9BQU8sQ0FBQyxHQUFHLFNBQVMsRUFBRWxCLEtBQUttQixZQUFZLENBQUNELE9BQU8sQ0FBQyxJQUFJO1FBQ3pKO1FBQ0EsT0FBT2hDLHFEQUFZQSxDQUFDbUIsSUFBSSxDQUFDTDtJQUMzQixFQUFFLE9BQU9NLE9BQU87UUFDZEMsUUFBUUQsS0FBSyxDQUFDLDZCQUE2QkE7UUFDM0MsT0FBT3BCLHFEQUFZQSxDQUFDbUIsSUFBSSxDQUFDO1lBQUVDLE9BQU87UUFBd0IsR0FBRztZQUFFRSxRQUFRO1FBQUk7SUFDN0U7QUFDRiIsInNvdXJjZXMiOlsiQzpcXEludmVudG9yeSBNYW5hZ2VtZW50IFN5c3RlbVxcSW52ZW50b3J5LU1hbmFnZW1lbnQtU3lzdGVtXFxhcHBcXGFwaVxcaXRlbXNcXHJvdXRlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHR5cGUgTmV4dFJlcXVlc3QsIE5leHRSZXNwb25zZSB9IGZyb20gXCJuZXh0L3NlcnZlclwiXHJcbmltcG9ydCB7IGdldEludmVudG9yeUl0ZW1zLCBhZGRJbnZlbnRvcnlJdGVtLCBhZGRMb2cgfSBmcm9tIFwiQC9saWIvZ29vZ2xlLXNoZWV0c1wiXHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gR0VUKHJlcXVlc3Q6IE5leHRSZXF1ZXN0KSB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHNlYXJjaFBhcmFtcyA9IHJlcXVlc3QubmV4dFVybC5zZWFyY2hQYXJhbXNcclxuICAgIGNvbnN0IHNlYXJjaCA9IHNlYXJjaFBhcmFtcy5nZXQoXCJzZWFyY2hcIilcclxuXHJcbiAgICBsZXQgaXRlbXMgPSBhd2FpdCBnZXRJbnZlbnRvcnlJdGVtcygpXHJcblxyXG4gICAgaWYgKHNlYXJjaCkge1xyXG4gICAgICBjb25zdCBzZWFyY2hMb3dlciA9IHNlYXJjaC50b0xvd2VyQ2FzZSgpXHJcbiAgICAgIGl0ZW1zID0gaXRlbXMuZmlsdGVyKFxyXG4gICAgICAgIChpdGVtKSA9PlxyXG4gICAgICAgICAgaXRlbS5uYW1lLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc2VhcmNoTG93ZXIpIHx8XHJcbiAgICAgICAgICBpdGVtLnNrdS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaExvd2VyKSB8fFxyXG4gICAgICAgICAgaXRlbS5jYXRlZ29yeS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaExvd2VyKSxcclxuICAgICAgKVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbihpdGVtcylcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcihcIlt2MF0gRXJyb3IgZmV0Y2hpbmcgaXRlbXM6XCIsIGVycm9yKVxyXG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgZXJyb3I6IFwiRmFpbGVkIHRvIGZldGNoIGl0ZW1zXCIgfSwgeyBzdGF0dXM6IDUwMCB9KVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIFBPU1QocmVxdWVzdDogTmV4dFJlcXVlc3QpIHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgYm9keSA9IGF3YWl0IHJlcXVlc3QuanNvbigpXHJcbiAgICBjb25zdCBpdGVtID0gYXdhaXQgYWRkSW52ZW50b3J5SXRlbShib2R5KVxyXG4gICAgYXdhaXQgYWRkTG9nKHtcclxuICAgICAgb3BlcmF0aW9uOiBcImNyZWF0ZVwiLFxyXG4gICAgICBpdGVtSWQ6IGl0ZW0uaWQsXHJcbiAgICAgIGl0ZW1OYW1lOiBpdGVtLm5hbWUsXHJcbiAgICAgIGRldGFpbHM6IGBBZGRlZCBcIiR7aXRlbS5uYW1lfVwiIChTS1U6ICR7aXRlbS5za3V9KSAtIFF0eTogJHtpdGVtLnF1YW50aXR5fSwgQ29zdDog4oKxJHtpdGVtLmNvc3RQcmljZS50b0ZpeGVkKDIpfSwgU2VsbDog4oKxJHtpdGVtLnNlbGxpbmdQcmljZS50b0ZpeGVkKDIpfWBcclxuICAgIH0pXHJcbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oaXRlbSlcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcihcIlt2MF0gRXJyb3IgY3JlYXRpbmcgaXRlbTpcIiwgZXJyb3IpXHJcbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBlcnJvcjogXCJGYWlsZWQgdG8gY3JlYXRlIGl0ZW1cIiB9LCB7IHN0YXR1czogNTAwIH0pXHJcbiAgfVxyXG59XHJcbiJdLCJuYW1lcyI6WyJOZXh0UmVzcG9uc2UiLCJnZXRJbnZlbnRvcnlJdGVtcyIsImFkZEludmVudG9yeUl0ZW0iLCJhZGRMb2ciLCJHRVQiLCJyZXF1ZXN0Iiwic2VhcmNoUGFyYW1zIiwibmV4dFVybCIsInNlYXJjaCIsImdldCIsIml0ZW1zIiwic2VhcmNoTG93ZXIiLCJ0b0xvd2VyQ2FzZSIsImZpbHRlciIsIml0ZW0iLCJuYW1lIiwiaW5jbHVkZXMiLCJza3UiLCJjYXRlZ29yeSIsImpzb24iLCJlcnJvciIsImNvbnNvbGUiLCJzdGF0dXMiLCJQT1NUIiwiYm9keSIsIm9wZXJhdGlvbiIsIml0ZW1JZCIsImlkIiwiaXRlbU5hbWUiLCJkZXRhaWxzIiwicXVhbnRpdHkiLCJjb3N0UHJpY2UiLCJ0b0ZpeGVkIiwic2VsbGluZ1ByaWNlIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./app/api/items/route.ts\n");

/***/ }),

/***/ "(rsc)/./lib/google-sheets.ts":
/*!******************************!*\
  !*** ./lib/google-sheets.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   addInventoryItem: () => (/* binding */ addInventoryItem),\n/* harmony export */   addLog: () => (/* binding */ addLog),\n/* harmony export */   addRestock: () => (/* binding */ addRestock),\n/* harmony export */   addTransaction: () => (/* binding */ addTransaction),\n/* harmony export */   deleteInventoryItem: () => (/* binding */ deleteInventoryItem),\n/* harmony export */   getGoogleSheetsClient: () => (/* binding */ getGoogleSheetsClient),\n/* harmony export */   getInventoryItems: () => (/* binding */ getInventoryItems),\n/* harmony export */   getLogs: () => (/* binding */ getLogs),\n/* harmony export */   getRestocks: () => (/* binding */ getRestocks),\n/* harmony export */   getTransactions: () => (/* binding */ getTransactions),\n/* harmony export */   updateInventoryItem: () => (/* binding */ updateInventoryItem)\n/* harmony export */ });\n/* harmony import */ var googleapis__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! googleapis */ \"(rsc)/./node_modules/googleapis/build/src/index.js\");\n/* harmony import */ var _barrel_optimize_names_format_parse_date_fns__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! __barrel_optimize__?names=format,parse!=!date-fns */ \"(rsc)/./node_modules/date-fns/format.js\");\n/* harmony import */ var _barrel_optimize_names_format_parse_date_fns__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! __barrel_optimize__?names=format,parse!=!date-fns */ \"(rsc)/./node_modules/date-fns/parse.js\");\n\n\nconst SCOPES = [\n    \"https://www.googleapis.com/auth/spreadsheets\"\n];\nconst formatTimestamp = (date)=>(0,_barrel_optimize_names_format_parse_date_fns__WEBPACK_IMPORTED_MODULE_0__.format)(date, \"yyyy-MM-dd / hh:mm a\");\nasync function getGoogleSheetsClient() {\n    const auth = new googleapis__WEBPACK_IMPORTED_MODULE_1__.google.auth.GoogleAuth({\n        credentials: {\n            client_email: process.env.GOOGLE_CLIENT_EMAIL,\n            private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\\\n/g, \"\\n\")\n        },\n        scopes: SCOPES\n    });\n    const sheets = googleapis__WEBPACK_IMPORTED_MODULE_1__.google.sheets({\n        version: \"v4\",\n        auth\n    });\n    return sheets;\n}\nasync function getInventoryItems() {\n    const sheets = await getGoogleSheetsClient();\n    const spreadsheetId = process.env.GOOGLE_SHEET_ID;\n    const response = await sheets.spreadsheets.values.get({\n        spreadsheetId,\n        range: \"Inventory!A2:J\"\n    });\n    const rows = response.data.values || [];\n    return rows.map((row)=>({\n            id: row[0] || \"\",\n            name: row[1] || \"\",\n            sku: row[2] || \"\",\n            category: row[3] || \"\",\n            quantity: Number.parseInt(row[4] || \"0\"),\n            costPrice: Number.parseFloat(row[5] || \"0\"),\n            sellingPrice: Number.parseFloat(row[6] || \"0\"),\n            reorderLevel: Number.parseInt(row[7] || \"0\"),\n            supplier: row[8] || \"\",\n            lastUpdated: row[9] || formatTimestamp(new Date())\n        }));\n}\nasync function addInventoryItem(item) {\n    const sheets = await getGoogleSheetsClient();\n    const spreadsheetId = process.env.GOOGLE_SHEET_ID;\n    const id = `ITEM-${Date.now()}`;\n    const lastUpdated = formatTimestamp(new Date());\n    const values = [\n        [\n            id,\n            item.name,\n            item.sku,\n            item.category,\n            item.quantity,\n            item.costPrice,\n            item.sellingPrice,\n            item.reorderLevel,\n            item.supplier,\n            lastUpdated\n        ]\n    ];\n    await sheets.spreadsheets.values.append({\n        spreadsheetId,\n        range: \"Inventory!A:J\",\n        valueInputOption: \"RAW\",\n        requestBody: {\n            values\n        }\n    });\n    return {\n        ...item,\n        id,\n        lastUpdated\n    };\n}\nasync function updateInventoryItem(id, updates) {\n    const sheets = await getGoogleSheetsClient();\n    const spreadsheetId = process.env.GOOGLE_SHEET_ID;\n    const items = await getInventoryItems();\n    const index = items.findIndex((item)=>item.id === id);\n    if (index === -1) {\n        throw new Error(\"Item not found\");\n    }\n    const rowNumber = index + 2;\n    // Always update lastUpdated if not provided\n    if (!updates.lastUpdated) {\n        updates.lastUpdated = formatTimestamp(new Date());\n    }\n    const fieldToColumn = {\n        id: 0,\n        name: 1,\n        sku: 2,\n        category: 3,\n        quantity: 4,\n        costPrice: 5,\n        sellingPrice: 6,\n        reorderLevel: 7,\n        supplier: 8,\n        lastUpdated: 9\n    };\n    const requests = [];\n    for (const [key, value] of Object.entries(updates)){\n        const fieldKey = key;\n        const col = fieldToColumn[fieldKey];\n        if (col !== undefined && value !== undefined) {\n            let userEnteredValue;\n            if (typeof value === 'number') {\n                userEnteredValue = {\n                    numberValue: value\n                };\n            } else if (typeof value === 'string') {\n                userEnteredValue = {\n                    stringValue: value\n                };\n            } else {\n                continue;\n            }\n            requests.push({\n                updateCells: {\n                    range: {\n                        sheetId: 0,\n                        startRowIndex: rowNumber - 1,\n                        endRowIndex: rowNumber,\n                        startColumnIndex: col,\n                        endColumnIndex: col + 1\n                    },\n                    fields: \"userEnteredValue\",\n                    rows: [\n                        {\n                            values: [\n                                {\n                                    userEnteredValue\n                                }\n                            ]\n                        }\n                    ]\n                }\n            });\n        }\n    }\n    if (requests.length > 0) {\n        await sheets.spreadsheets.batchUpdate({\n            spreadsheetId,\n            requestBody: {\n                requests\n            }\n        });\n    }\n}\nasync function deleteInventoryItem(id) {\n    const sheets = await getGoogleSheetsClient();\n    const spreadsheetId = process.env.GOOGLE_SHEET_ID;\n    const items = await getInventoryItems();\n    const index = items.findIndex((item)=>item.id === id);\n    if (index === -1) {\n        throw new Error(\"Item not found\");\n    }\n    const rowNumber = index + 2;\n    await sheets.spreadsheets.batchUpdate({\n        spreadsheetId,\n        requestBody: {\n            requests: [\n                {\n                    deleteDimension: {\n                        range: {\n                            sheetId: 0,\n                            dimension: \"ROWS\",\n                            startIndex: rowNumber - 1,\n                            endIndex: rowNumber\n                        }\n                    }\n                }\n            ]\n        }\n    });\n}\nasync function addTransaction(transaction) {\n    const sheets = await getGoogleSheetsClient();\n    const spreadsheetId = process.env.GOOGLE_SHEET_ID;\n    const id = `TXN-${Date.now()}`;\n    const timestamp = formatTimestamp(new Date());\n    const values = [\n        [\n            id,\n            transaction.itemId,\n            transaction.itemName,\n            transaction.quantity,\n            transaction.costPrice,\n            transaction.sellingPrice,\n            transaction.totalCost,\n            transaction.totalRevenue,\n            transaction.profit,\n            timestamp,\n            transaction.type,\n            transaction.paymentMethod,\n            transaction.referenceNumber || \"\"\n        ]\n    ];\n    await sheets.spreadsheets.values.append({\n        spreadsheetId,\n        range: \"Transactions!A:M\",\n        valueInputOption: \"RAW\",\n        requestBody: {\n            values\n        }\n    });\n    return {\n        ...transaction,\n        id,\n        timestamp\n    };\n}\nasync function getTransactions() {\n    const sheets = await getGoogleSheetsClient();\n    const spreadsheetId = process.env.GOOGLE_SHEET_ID;\n    const response = await sheets.spreadsheets.values.get({\n        spreadsheetId,\n        range: \"Transactions!A2:M\"\n    });\n    const rows = response.data.values || [];\n    return rows.map((row)=>({\n            id: row[0] || \"\",\n            itemId: row[1] || \"\",\n            itemName: row[2] || \"\",\n            quantity: Number.parseInt(row[3] || \"0\"),\n            costPrice: Number.parseFloat(row[4] || \"0\"),\n            sellingPrice: Number.parseFloat(row[5] || \"0\"),\n            totalCost: Number.parseFloat(row[6] || \"0\"),\n            totalRevenue: Number.parseFloat(row[7] || \"0\"),\n            profit: Number.parseFloat(row[8] || \"0\"),\n            timestamp: row[9] || \"\",\n            type: row[10] || \"sale\",\n            paymentMethod: row[11] || \"cash\",\n            referenceNumber: row[12] || \"\"\n        }));\n}\nasync function initializeLogsSheet() {\n    const sheets = await getGoogleSheetsClient();\n    const spreadsheetId = process.env.GOOGLE_SHEET_ID;\n    try {\n        await sheets.spreadsheets.values.get({\n            spreadsheetId,\n            range: \"Logs!A1:F1\"\n        });\n    } catch (error) {\n        // Sheet doesn't exist, create it\n        await sheets.spreadsheets.batchUpdate({\n            spreadsheetId,\n            requestBody: {\n                requests: [\n                    {\n                        addSheet: {\n                            properties: {\n                                title: 'Logs',\n                                gridProperties: {\n                                    rowCount: 1000,\n                                    columnCount: 6\n                                }\n                            }\n                        }\n                    }\n                ]\n            }\n        });\n        // Add headers\n        await sheets.spreadsheets.values.update({\n            spreadsheetId,\n            range: \"Logs!A1:F1\",\n            valueInputOption: \"RAW\",\n            requestBody: {\n                values: [\n                    [\n                        \"ID\",\n                        \"Operation\",\n                        \"Item ID\",\n                        \"Item Name\",\n                        \"Details\",\n                        \"Timestamp\"\n                    ]\n                ]\n            }\n        });\n    }\n}\nasync function addLog(log) {\n    await initializeLogsSheet();\n    const sheets = await getGoogleSheetsClient();\n    const spreadsheetId = process.env.GOOGLE_SHEET_ID;\n    const id = `LOG-${Date.now()}`;\n    const timestamp = formatTimestamp(new Date());\n    const values = [\n        [\n            id,\n            log.operation,\n            log.itemId || \"\",\n            log.itemName || \"\",\n            log.details,\n            timestamp\n        ]\n    ];\n    await sheets.spreadsheets.values.append({\n        spreadsheetId,\n        range: \"Logs!A:F\",\n        valueInputOption: \"RAW\",\n        requestBody: {\n            values\n        }\n    });\n    return {\n        ...log,\n        id,\n        timestamp\n    };\n}\nasync function getLogs() {\n    await initializeLogsSheet();\n    const sheets = await getGoogleSheetsClient();\n    const spreadsheetId = process.env.GOOGLE_SHEET_ID;\n    const response = await sheets.spreadsheets.values.get({\n        spreadsheetId,\n        range: \"Logs!A2:F\"\n    });\n    const rows = response.data.values || [];\n    return rows.map((row)=>({\n            id: row[0] || \"\",\n            operation: row[1] || \"\",\n            itemId: row[2] || \"\",\n            itemName: row[3] || \"\",\n            details: row[4] || \"\",\n            timestamp: row[5] || \"\"\n        })).sort((a, b)=>(0,_barrel_optimize_names_format_parse_date_fns__WEBPACK_IMPORTED_MODULE_2__.parse)(b.timestamp, \"yyyy-MM-dd / hh:mm a\", new Date()).getTime() - (0,_barrel_optimize_names_format_parse_date_fns__WEBPACK_IMPORTED_MODULE_2__.parse)(a.timestamp, \"yyyy-MM-dd / hh:mm a\", new Date()).getTime());\n}\nasync function initializeRestockSheet() {\n    const sheets = await getGoogleSheetsClient();\n    const spreadsheetId = process.env.GOOGLE_SHEET_ID;\n    try {\n        await sheets.spreadsheets.values.get({\n            spreadsheetId,\n            range: \"Restock!A1:G1\"\n        });\n    } catch (error) {\n        // Sheet doesn't exist, create it\n        await sheets.spreadsheets.batchUpdate({\n            spreadsheetId,\n            requestBody: {\n                requests: [\n                    {\n                        addSheet: {\n                            properties: {\n                                title: 'Restock',\n                                gridProperties: {\n                                    rowCount: 1000,\n                                    columnCount: 7\n                                }\n                            }\n                        }\n                    }\n                ]\n            }\n        });\n        // Add headers\n        await sheets.spreadsheets.values.update({\n            spreadsheetId,\n            range: \"Restock!A1:G1\",\n            valueInputOption: \"RAW\",\n            requestBody: {\n                values: [\n                    [\n                        \"ID\",\n                        \"Item ID\",\n                        \"Item Name\",\n                        \"Quantity Added\",\n                        \"Cost Price\",\n                        \"Total Cost\",\n                        \"Timestamp\"\n                    ]\n                ]\n            }\n        });\n    }\n}\nasync function addRestock(restock) {\n    await initializeRestockSheet();\n    const sheets = await getGoogleSheetsClient();\n    const spreadsheetId = process.env.GOOGLE_SHEET_ID;\n    const id = `RSTK-${Date.now()}`;\n    const timestamp = formatTimestamp(new Date());\n    const values = [\n        [\n            id,\n            restock.itemId,\n            restock.itemName,\n            restock.quantity,\n            restock.costPrice,\n            restock.totalCost,\n            timestamp\n        ]\n    ];\n    await sheets.spreadsheets.values.append({\n        spreadsheetId,\n        range: \"Restock!A:G\",\n        valueInputOption: \"RAW\",\n        requestBody: {\n            values\n        }\n    });\n    return {\n        ...restock,\n        id,\n        timestamp\n    };\n}\nasync function getRestocks() {\n    await initializeRestockSheet();\n    const sheets = await getGoogleSheetsClient();\n    const spreadsheetId = process.env.GOOGLE_SHEET_ID;\n    const response = await sheets.spreadsheets.values.get({\n        spreadsheetId,\n        range: \"Restock!A2:G\"\n    });\n    const rows = response.data.values || [];\n    return rows.map((row)=>({\n            id: row[0] || \"\",\n            itemId: row[1] || \"\",\n            itemName: row[2] || \"\",\n            quantity: Number.parseInt(row[3] || \"0\"),\n            costPrice: Number.parseFloat(row[4] || \"0\"),\n            totalCost: Number.parseFloat(row[5] || \"0\"),\n            timestamp: row[6] || \"\"\n        })).sort((a, b)=>(0,_barrel_optimize_names_format_parse_date_fns__WEBPACK_IMPORTED_MODULE_2__.parse)(b.timestamp, \"yyyy-MM-dd / hh:mm a\", new Date()).getTime() - (0,_barrel_optimize_names_format_parse_date_fns__WEBPACK_IMPORTED_MODULE_2__.parse)(a.timestamp, \"yyyy-MM-dd / hh:mm a\", new Date()).getTime());\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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SUFBSTNDLFFBQVFzRSxPQUFPLEtBQUtqSCxtRkFBS0EsQ0FBQytHLEVBQUV6QixTQUFTLEVBQUUsd0JBQXdCLElBQUkzQyxRQUFRc0UsT0FBTztBQUN0SiIsInNvdXJjZXMiOlsiQzpcXEludmVudG9yeSBNYW5hZ2VtZW50IFN5c3RlbVxcSW52ZW50b3J5LU1hbmFnZW1lbnQtU3lzdGVtXFxsaWJcXGdvb2dsZS1zaGVldHMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZ29vZ2xlIH0gZnJvbSBcImdvb2dsZWFwaXNcIlxyXG5pbXBvcnQgeyBmb3JtYXQsIHBhcnNlIH0gZnJvbSBcImRhdGUtZm5zXCJcclxuaW1wb3J0IHR5cGUgeyBJbnZlbnRvcnlJdGVtLCBUcmFuc2FjdGlvbiwgTG9nLCBSZXN0b2NrIH0gZnJvbSBcIi4vdHlwZXNcIlxyXG5cclxuY29uc3QgU0NPUEVTID0gW1wiaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vYXV0aC9zcHJlYWRzaGVldHNcIl1cclxuXHJcbmNvbnN0IGZvcm1hdFRpbWVzdGFtcCA9IChkYXRlOiBEYXRlKSA9PiBmb3JtYXQoZGF0ZSwgXCJ5eXl5LU1NLWRkIC8gaGg6bW0gYVwiKVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEdvb2dsZVNoZWV0c0NsaWVudCgpIHtcclxuICBjb25zdCBhdXRoID0gbmV3IGdvb2dsZS5hdXRoLkdvb2dsZUF1dGgoe1xyXG4gICAgY3JlZGVudGlhbHM6IHtcclxuICAgICAgY2xpZW50X2VtYWlsOiBwcm9jZXNzLmVudi5HT09HTEVfQ0xJRU5UX0VNQUlMLFxyXG4gICAgICBwcml2YXRlX2tleTogcHJvY2Vzcy5lbnYuR09PR0xFX1BSSVZBVEVfS0VZPy5yZXBsYWNlKC9cXFxcbi9nLCBcIlxcblwiKSxcclxuICAgIH0sXHJcbiAgICBzY29wZXM6IFNDT1BFUyxcclxuICB9KVxyXG5cclxuICBjb25zdCBzaGVldHMgPSBnb29nbGUuc2hlZXRzKHsgdmVyc2lvbjogXCJ2NFwiLCBhdXRoIH0pXHJcbiAgcmV0dXJuIHNoZWV0c1xyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0SW52ZW50b3J5SXRlbXMoKTogUHJvbWlzZTxJbnZlbnRvcnlJdGVtW10+IHtcclxuICBjb25zdCBzaGVldHMgPSBhd2FpdCBnZXRHb29nbGVTaGVldHNDbGllbnQoKVxyXG4gIGNvbnN0IHNwcmVhZHNoZWV0SWQgPSBwcm9jZXNzLmVudi5HT09HTEVfU0hFRVRfSURcclxuXHJcbiAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBzaGVldHMuc3ByZWFkc2hlZXRzLnZhbHVlcy5nZXQoe1xyXG4gICAgc3ByZWFkc2hlZXRJZCxcclxuICAgIHJhbmdlOiBcIkludmVudG9yeSFBMjpKXCIsXHJcbiAgfSlcclxuXHJcbiAgY29uc3Qgcm93cyA9IHJlc3BvbnNlLmRhdGEudmFsdWVzIHx8IFtdXHJcbiAgcmV0dXJuIHJvd3MubWFwKChyb3cpID0+ICh7XHJcbiAgICBpZDogcm93WzBdIHx8IFwiXCIsXHJcbiAgICBuYW1lOiByb3dbMV0gfHwgXCJcIixcclxuICAgIHNrdTogcm93WzJdIHx8IFwiXCIsXHJcbiAgICBjYXRlZ29yeTogcm93WzNdIHx8IFwiXCIsXHJcbiAgICBxdWFudGl0eTogTnVtYmVyLnBhcnNlSW50KHJvd1s0XSB8fCBcIjBcIiksXHJcbiAgICBjb3N0UHJpY2U6IE51bWJlci5wYXJzZUZsb2F0KHJvd1s1XSB8fCBcIjBcIiksXHJcbiAgICBzZWxsaW5nUHJpY2U6IE51bWJlci5wYXJzZUZsb2F0KHJvd1s2XSB8fCBcIjBcIiksXHJcbiAgICByZW9yZGVyTGV2ZWw6IE51bWJlci5wYXJzZUludChyb3dbN10gfHwgXCIwXCIpLFxyXG4gICAgc3VwcGxpZXI6IHJvd1s4XSB8fCBcIlwiLFxyXG4gICAgbGFzdFVwZGF0ZWQ6IHJvd1s5XSB8fCBmb3JtYXRUaW1lc3RhbXAobmV3IERhdGUoKSksXHJcbiAgfSkpXHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBhZGRJbnZlbnRvcnlJdGVtKGl0ZW06IE9taXQ8SW52ZW50b3J5SXRlbSwgXCJpZFwiIHwgXCJsYXN0VXBkYXRlZFwiPik6IFByb21pc2U8SW52ZW50b3J5SXRlbT4ge1xyXG4gIGNvbnN0IHNoZWV0cyA9IGF3YWl0IGdldEdvb2dsZVNoZWV0c0NsaWVudCgpXHJcbiAgY29uc3Qgc3ByZWFkc2hlZXRJZCA9IHByb2Nlc3MuZW52LkdPT0dMRV9TSEVFVF9JRFxyXG5cclxuICBjb25zdCBpZCA9IGBJVEVNLSR7RGF0ZS5ub3coKX1gXHJcbiAgY29uc3QgbGFzdFVwZGF0ZWQgPSBmb3JtYXRUaW1lc3RhbXAobmV3IERhdGUoKSlcclxuXHJcbiAgY29uc3QgdmFsdWVzID0gW1xyXG4gICAgW1xyXG4gICAgICBpZCxcclxuICAgICAgaXRlbS5uYW1lLFxyXG4gICAgICBpdGVtLnNrdSxcclxuICAgICAgaXRlbS5jYXRlZ29yeSxcclxuICAgICAgaXRlbS5xdWFudGl0eSxcclxuICAgICAgaXRlbS5jb3N0UHJpY2UsXHJcbiAgICAgIGl0ZW0uc2VsbGluZ1ByaWNlLFxyXG4gICAgICBpdGVtLnJlb3JkZXJMZXZlbCxcclxuICAgICAgaXRlbS5zdXBwbGllcixcclxuICAgICAgbGFzdFVwZGF0ZWQsXHJcbiAgICBdLFxyXG4gIF1cclxuXHJcbiAgYXdhaXQgc2hlZXRzLnNwcmVhZHNoZWV0cy52YWx1ZXMuYXBwZW5kKHtcclxuICAgIHNwcmVhZHNoZWV0SWQsXHJcbiAgICByYW5nZTogXCJJbnZlbnRvcnkhQTpKXCIsXHJcbiAgICB2YWx1ZUlucHV0T3B0aW9uOiBcIlJBV1wiLFxyXG4gICAgcmVxdWVzdEJvZHk6IHsgdmFsdWVzIH0sXHJcbiAgfSlcclxuXHJcbiAgcmV0dXJuIHsgLi4uaXRlbSwgaWQsIGxhc3RVcGRhdGVkIH1cclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHVwZGF0ZUludmVudG9yeUl0ZW0oaWQ6IHN0cmluZywgdXBkYXRlczogUGFydGlhbDxJbnZlbnRvcnlJdGVtPik6IFByb21pc2U8dm9pZD4ge1xyXG4gIGNvbnN0IHNoZWV0cyA9IGF3YWl0IGdldEdvb2dsZVNoZWV0c0NsaWVudCgpXHJcbiAgY29uc3Qgc3ByZWFkc2hlZXRJZCA9IHByb2Nlc3MuZW52LkdPT0dMRV9TSEVFVF9JRFxyXG5cclxuICBjb25zdCBpdGVtcyA9IGF3YWl0IGdldEludmVudG9yeUl0ZW1zKClcclxuICBjb25zdCBpbmRleCA9IGl0ZW1zLmZpbmRJbmRleCgoaXRlbSkgPT4gaXRlbS5pZCA9PT0gaWQpXHJcblxyXG4gIGlmIChpbmRleCA9PT0gLTEpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcihcIkl0ZW0gbm90IGZvdW5kXCIpXHJcbiAgfVxyXG5cclxuICBjb25zdCByb3dOdW1iZXIgPSBpbmRleCArIDJcclxuXHJcbiAgLy8gQWx3YXlzIHVwZGF0ZSBsYXN0VXBkYXRlZCBpZiBub3QgcHJvdmlkZWRcclxuICBpZiAoIXVwZGF0ZXMubGFzdFVwZGF0ZWQpIHtcclxuICAgIHVwZGF0ZXMubGFzdFVwZGF0ZWQgPSBmb3JtYXRUaW1lc3RhbXAobmV3IERhdGUoKSlcclxuICB9XHJcblxyXG4gIGNvbnN0IGZpZWxkVG9Db2x1bW46IFJlY29yZDxrZXlvZiBJbnZlbnRvcnlJdGVtLCBudW1iZXI+ID0ge1xyXG4gICAgaWQ6IDAsXHJcbiAgICBuYW1lOiAxLFxyXG4gICAgc2t1OiAyLFxyXG4gICAgY2F0ZWdvcnk6IDMsXHJcbiAgICBxdWFudGl0eTogNCxcclxuICAgIGNvc3RQcmljZTogNSxcclxuICAgIHNlbGxpbmdQcmljZTogNixcclxuICAgIHJlb3JkZXJMZXZlbDogNyxcclxuICAgIHN1cHBsaWVyOiA4LFxyXG4gICAgbGFzdFVwZGF0ZWQ6IDksXHJcbiAgfVxyXG5cclxuICBjb25zdCByZXF1ZXN0cyA9IFtdXHJcblxyXG4gIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKHVwZGF0ZXMpKSB7XHJcbiAgICBjb25zdCBmaWVsZEtleSA9IGtleSBhcyBrZXlvZiBJbnZlbnRvcnlJdGVtXHJcbiAgICBjb25zdCBjb2wgPSBmaWVsZFRvQ29sdW1uW2ZpZWxkS2V5XVxyXG4gICAgaWYgKGNvbCAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgbGV0IHVzZXJFbnRlcmVkVmFsdWU6IGFueVxyXG4gICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJykge1xyXG4gICAgICAgIHVzZXJFbnRlcmVkVmFsdWUgPSB7IG51bWJlclZhbHVlOiB2YWx1ZSB9XHJcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgIHVzZXJFbnRlcmVkVmFsdWUgPSB7IHN0cmluZ1ZhbHVlOiB2YWx1ZSB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY29udGludWVcclxuICAgICAgfVxyXG5cclxuICAgICAgcmVxdWVzdHMucHVzaCh7XHJcbiAgICAgICAgdXBkYXRlQ2VsbHM6IHtcclxuICAgICAgICAgIHJhbmdlOiB7XHJcbiAgICAgICAgICAgIHNoZWV0SWQ6IDAsXHJcbiAgICAgICAgICAgIHN0YXJ0Um93SW5kZXg6IHJvd051bWJlciAtIDEsXHJcbiAgICAgICAgICAgIGVuZFJvd0luZGV4OiByb3dOdW1iZXIsXHJcbiAgICAgICAgICAgIHN0YXJ0Q29sdW1uSW5kZXg6IGNvbCxcclxuICAgICAgICAgICAgZW5kQ29sdW1uSW5kZXg6IGNvbCArIDEsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgZmllbGRzOiBcInVzZXJFbnRlcmVkVmFsdWVcIixcclxuICAgICAgICAgIHJvd3M6IFt7XHJcbiAgICAgICAgICAgIHZhbHVlczogW3tcclxuICAgICAgICAgICAgICB1c2VyRW50ZXJlZFZhbHVlXHJcbiAgICAgICAgICAgIH1dXHJcbiAgICAgICAgICB9XVxyXG4gICAgICAgIH1cclxuICAgICAgfSlcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGlmIChyZXF1ZXN0cy5sZW5ndGggPiAwKSB7XHJcbiAgICBhd2FpdCBzaGVldHMuc3ByZWFkc2hlZXRzLmJhdGNoVXBkYXRlKHtcclxuICAgICAgc3ByZWFkc2hlZXRJZCxcclxuICAgICAgcmVxdWVzdEJvZHk6IHtcclxuICAgICAgICByZXF1ZXN0c1xyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRlbGV0ZUludmVudG9yeUl0ZW0oaWQ6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xyXG4gIGNvbnN0IHNoZWV0cyA9IGF3YWl0IGdldEdvb2dsZVNoZWV0c0NsaWVudCgpXHJcbiAgY29uc3Qgc3ByZWFkc2hlZXRJZCA9IHByb2Nlc3MuZW52LkdPT0dMRV9TSEVFVF9JRFxyXG5cclxuICBjb25zdCBpdGVtcyA9IGF3YWl0IGdldEludmVudG9yeUl0ZW1zKClcclxuICBjb25zdCBpbmRleCA9IGl0ZW1zLmZpbmRJbmRleCgoaXRlbSkgPT4gaXRlbS5pZCA9PT0gaWQpXHJcblxyXG4gIGlmIChpbmRleCA9PT0gLTEpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcihcIkl0ZW0gbm90IGZvdW5kXCIpXHJcbiAgfVxyXG5cclxuICBjb25zdCByb3dOdW1iZXIgPSBpbmRleCArIDJcclxuXHJcbiAgYXdhaXQgc2hlZXRzLnNwcmVhZHNoZWV0cy5iYXRjaFVwZGF0ZSh7XHJcbiAgICBzcHJlYWRzaGVldElkLFxyXG4gICAgcmVxdWVzdEJvZHk6IHtcclxuICAgICAgcmVxdWVzdHM6IFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBkZWxldGVEaW1lbnNpb246IHtcclxuICAgICAgICAgICAgcmFuZ2U6IHtcclxuICAgICAgICAgICAgICBzaGVldElkOiAwLFxyXG4gICAgICAgICAgICAgIGRpbWVuc2lvbjogXCJST1dTXCIsXHJcbiAgICAgICAgICAgICAgc3RhcnRJbmRleDogcm93TnVtYmVyIC0gMSxcclxuICAgICAgICAgICAgICBlbmRJbmRleDogcm93TnVtYmVyLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9LFxyXG4gICAgICBdLFxyXG4gICAgfSxcclxuICB9KVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYWRkVHJhbnNhY3Rpb24odHJhbnNhY3Rpb246IE9taXQ8VHJhbnNhY3Rpb24sIFwiaWRcIiB8IFwidGltZXN0YW1wXCI+KTogUHJvbWlzZTxUcmFuc2FjdGlvbj4ge1xyXG4gIGNvbnN0IHNoZWV0cyA9IGF3YWl0IGdldEdvb2dsZVNoZWV0c0NsaWVudCgpXHJcbiAgY29uc3Qgc3ByZWFkc2hlZXRJZCA9IHByb2Nlc3MuZW52LkdPT0dMRV9TSEVFVF9JRFxyXG5cclxuICBjb25zdCBpZCA9IGBUWE4tJHtEYXRlLm5vdygpfWBcclxuICBjb25zdCB0aW1lc3RhbXAgPSBmb3JtYXRUaW1lc3RhbXAobmV3IERhdGUoKSlcclxuXHJcbiAgY29uc3QgdmFsdWVzID0gW1xyXG4gICAgW1xyXG4gICAgICBpZCxcclxuICAgICAgdHJhbnNhY3Rpb24uaXRlbUlkLFxyXG4gICAgICB0cmFuc2FjdGlvbi5pdGVtTmFtZSxcclxuICAgICAgdHJhbnNhY3Rpb24ucXVhbnRpdHksXHJcbiAgICAgIHRyYW5zYWN0aW9uLmNvc3RQcmljZSxcclxuICAgICAgdHJhbnNhY3Rpb24uc2VsbGluZ1ByaWNlLFxyXG4gICAgICB0cmFuc2FjdGlvbi50b3RhbENvc3QsXHJcbiAgICAgIHRyYW5zYWN0aW9uLnRvdGFsUmV2ZW51ZSxcclxuICAgICAgdHJhbnNhY3Rpb24ucHJvZml0LFxyXG4gICAgICB0aW1lc3RhbXAsXHJcbiAgICAgIHRyYW5zYWN0aW9uLnR5cGUsXHJcbiAgICAgIHRyYW5zYWN0aW9uLnBheW1lbnRNZXRob2QsXHJcbiAgICAgIHRyYW5zYWN0aW9uLnJlZmVyZW5jZU51bWJlciB8fCBcIlwiLFxyXG4gICAgXSxcclxuICBdXHJcblxyXG4gIGF3YWl0IHNoZWV0cy5zcHJlYWRzaGVldHMudmFsdWVzLmFwcGVuZCh7XHJcbiAgICBzcHJlYWRzaGVldElkLFxyXG4gICAgcmFuZ2U6IFwiVHJhbnNhY3Rpb25zIUE6TVwiLFxyXG4gICAgdmFsdWVJbnB1dE9wdGlvbjogXCJSQVdcIixcclxuICAgIHJlcXVlc3RCb2R5OiB7IHZhbHVlcyB9LFxyXG4gIH0pXHJcblxyXG4gIHJldHVybiB7IC4uLnRyYW5zYWN0aW9uLCBpZCwgdGltZXN0YW1wIH1cclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFRyYW5zYWN0aW9ucygpOiBQcm9taXNlPFRyYW5zYWN0aW9uW10+IHtcclxuICBjb25zdCBzaGVldHMgPSBhd2FpdCBnZXRHb29nbGVTaGVldHNDbGllbnQoKVxyXG4gIGNvbnN0IHNwcmVhZHNoZWV0SWQgPSBwcm9jZXNzLmVudi5HT09HTEVfU0hFRVRfSURcclxuXHJcbiAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBzaGVldHMuc3ByZWFkc2hlZXRzLnZhbHVlcy5nZXQoe1xyXG4gICAgc3ByZWFkc2hlZXRJZCxcclxuICAgIHJhbmdlOiBcIlRyYW5zYWN0aW9ucyFBMjpNXCIsXHJcbiAgfSlcclxuXHJcbiAgY29uc3Qgcm93cyA9IHJlc3BvbnNlLmRhdGEudmFsdWVzIHx8IFtdXHJcbiAgcmV0dXJuIHJvd3MubWFwKChyb3cpID0+ICh7XHJcbiAgICBpZDogcm93WzBdIHx8IFwiXCIsXHJcbiAgICBpdGVtSWQ6IHJvd1sxXSB8fCBcIlwiLFxyXG4gICAgaXRlbU5hbWU6IHJvd1syXSB8fCBcIlwiLFxyXG4gICAgcXVhbnRpdHk6IE51bWJlci5wYXJzZUludChyb3dbM10gfHwgXCIwXCIpLFxyXG4gICAgY29zdFByaWNlOiBOdW1iZXIucGFyc2VGbG9hdChyb3dbNF0gfHwgXCIwXCIpLFxyXG4gICAgc2VsbGluZ1ByaWNlOiBOdW1iZXIucGFyc2VGbG9hdChyb3dbNV0gfHwgXCIwXCIpLFxyXG4gICAgdG90YWxDb3N0OiBOdW1iZXIucGFyc2VGbG9hdChyb3dbNl0gfHwgXCIwXCIpLFxyXG4gICAgdG90YWxSZXZlbnVlOiBOdW1iZXIucGFyc2VGbG9hdChyb3dbN10gfHwgXCIwXCIpLFxyXG4gICAgcHJvZml0OiBOdW1iZXIucGFyc2VGbG9hdChyb3dbOF0gfHwgXCIwXCIpLFxyXG4gICAgdGltZXN0YW1wOiByb3dbOV0gfHwgXCJcIixcclxuICAgIHR5cGU6IChyb3dbMTBdIHx8IFwic2FsZVwiKSBhcyBcInNhbGVcIiB8IFwicmVzdG9ja1wiLFxyXG4gICAgcGF5bWVudE1ldGhvZDogKHJvd1sxMV0gfHwgXCJjYXNoXCIpIGFzICdjYXNoJyB8ICdnY2FzaCcgfCAncGF5bWF5YScsXHJcbiAgICByZWZlcmVuY2VOdW1iZXI6IHJvd1sxMl0gfHwgXCJcIixcclxuICB9KSlcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gaW5pdGlhbGl6ZUxvZ3NTaGVldCgpIHtcclxuICBjb25zdCBzaGVldHMgPSBhd2FpdCBnZXRHb29nbGVTaGVldHNDbGllbnQoKVxyXG4gIGNvbnN0IHNwcmVhZHNoZWV0SWQgPSBwcm9jZXNzLmVudi5HT09HTEVfU0hFRVRfSURcclxuXHJcbiAgdHJ5IHtcclxuICAgIGF3YWl0IHNoZWV0cy5zcHJlYWRzaGVldHMudmFsdWVzLmdldCh7XHJcbiAgICAgIHNwcmVhZHNoZWV0SWQsXHJcbiAgICAgIHJhbmdlOiBcIkxvZ3MhQTE6RjFcIlxyXG4gICAgfSlcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgLy8gU2hlZXQgZG9lc24ndCBleGlzdCwgY3JlYXRlIGl0XHJcbiAgICBhd2FpdCBzaGVldHMuc3ByZWFkc2hlZXRzLmJhdGNoVXBkYXRlKHtcclxuICAgICAgc3ByZWFkc2hlZXRJZCxcclxuICAgICAgcmVxdWVzdEJvZHk6IHtcclxuICAgICAgICByZXF1ZXN0czogW3tcclxuICAgICAgICAgIGFkZFNoZWV0OiB7XHJcbiAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgICAgICAgICB0aXRsZTogJ0xvZ3MnLFxyXG4gICAgICAgICAgICAgIGdyaWRQcm9wZXJ0aWVzOiB7XHJcbiAgICAgICAgICAgICAgICByb3dDb3VudDogMTAwMCxcclxuICAgICAgICAgICAgICAgIGNvbHVtbkNvdW50OiA2XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfV1cclxuICAgICAgfVxyXG4gICAgfSlcclxuICAgIC8vIEFkZCBoZWFkZXJzXHJcbiAgICBhd2FpdCBzaGVldHMuc3ByZWFkc2hlZXRzLnZhbHVlcy51cGRhdGUoe1xyXG4gICAgICBzcHJlYWRzaGVldElkLFxyXG4gICAgICByYW5nZTogXCJMb2dzIUExOkYxXCIsXHJcbiAgICAgIHZhbHVlSW5wdXRPcHRpb246IFwiUkFXXCIsXHJcbiAgICAgIHJlcXVlc3RCb2R5OiB7XHJcbiAgICAgICAgdmFsdWVzOiBbW1wiSURcIiwgXCJPcGVyYXRpb25cIiwgXCJJdGVtIElEXCIsIFwiSXRlbSBOYW1lXCIsIFwiRGV0YWlsc1wiLCBcIlRpbWVzdGFtcFwiXV1cclxuICAgICAgfVxyXG4gICAgfSlcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBhZGRMb2cobG9nOiBPbWl0PExvZywgXCJpZFwiIHwgXCJ0aW1lc3RhbXBcIj4pOiBQcm9taXNlPExvZz4ge1xyXG4gIGF3YWl0IGluaXRpYWxpemVMb2dzU2hlZXQoKVxyXG5cclxuICBjb25zdCBzaGVldHMgPSBhd2FpdCBnZXRHb29nbGVTaGVldHNDbGllbnQoKVxyXG4gIGNvbnN0IHNwcmVhZHNoZWV0SWQgPSBwcm9jZXNzLmVudi5HT09HTEVfU0hFRVRfSURcclxuXHJcbiAgY29uc3QgaWQgPSBgTE9HLSR7RGF0ZS5ub3coKX1gXHJcbiAgY29uc3QgdGltZXN0YW1wID0gZm9ybWF0VGltZXN0YW1wKG5ldyBEYXRlKCkpXHJcblxyXG4gIGNvbnN0IHZhbHVlcyA9IFtcclxuICAgIFtcclxuICAgICAgaWQsXHJcbiAgICAgIGxvZy5vcGVyYXRpb24sXHJcbiAgICAgIGxvZy5pdGVtSWQgfHwgXCJcIixcclxuICAgICAgbG9nLml0ZW1OYW1lIHx8IFwiXCIsXHJcbiAgICAgIGxvZy5kZXRhaWxzLFxyXG4gICAgICB0aW1lc3RhbXAsXHJcbiAgICBdLFxyXG4gIF1cclxuXHJcbiAgYXdhaXQgc2hlZXRzLnNwcmVhZHNoZWV0cy52YWx1ZXMuYXBwZW5kKHtcclxuICAgIHNwcmVhZHNoZWV0SWQsXHJcbiAgICByYW5nZTogXCJMb2dzIUE6RlwiLFxyXG4gICAgdmFsdWVJbnB1dE9wdGlvbjogXCJSQVdcIixcclxuICAgIHJlcXVlc3RCb2R5OiB7IHZhbHVlcyB9LFxyXG4gIH0pXHJcblxyXG4gIHJldHVybiB7IC4uLmxvZywgaWQsIHRpbWVzdGFtcCB9XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRMb2dzKCk6IFByb21pc2U8TG9nW10+IHtcclxuICBhd2FpdCBpbml0aWFsaXplTG9nc1NoZWV0KClcclxuXHJcbiAgY29uc3Qgc2hlZXRzID0gYXdhaXQgZ2V0R29vZ2xlU2hlZXRzQ2xpZW50KClcclxuICBjb25zdCBzcHJlYWRzaGVldElkID0gcHJvY2Vzcy5lbnYuR09PR0xFX1NIRUVUX0lEXHJcblxyXG4gIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgc2hlZXRzLnNwcmVhZHNoZWV0cy52YWx1ZXMuZ2V0KHtcclxuICAgIHNwcmVhZHNoZWV0SWQsXHJcbiAgICByYW5nZTogXCJMb2dzIUEyOkZcIixcclxuICB9KVxyXG5cclxuICBjb25zdCByb3dzID0gcmVzcG9uc2UuZGF0YS52YWx1ZXMgfHwgW11cclxuICByZXR1cm4gcm93cy5tYXAoKHJvdykgPT4gKHtcclxuICAgIGlkOiByb3dbMF0gfHwgXCJcIixcclxuICAgIG9wZXJhdGlvbjogcm93WzFdIHx8IFwiXCIsXHJcbiAgICBpdGVtSWQ6IHJvd1syXSB8fCBcIlwiLFxyXG4gICAgaXRlbU5hbWU6IHJvd1szXSB8fCBcIlwiLFxyXG4gICAgZGV0YWlsczogcm93WzRdIHx8IFwiXCIsXHJcbiAgICB0aW1lc3RhbXA6IHJvd1s1XSB8fCBcIlwiLFxyXG4gIH0pKS5zb3J0KChhLCBiKSA9PiBwYXJzZShiLnRpbWVzdGFtcCwgXCJ5eXl5LU1NLWRkIC8gaGg6bW0gYVwiLCBuZXcgRGF0ZSgpKS5nZXRUaW1lKCkgLSBwYXJzZShhLnRpbWVzdGFtcCwgXCJ5eXl5LU1NLWRkIC8gaGg6bW0gYVwiLCBuZXcgRGF0ZSgpKS5nZXRUaW1lKCkpXHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGluaXRpYWxpemVSZXN0b2NrU2hlZXQoKSB7XHJcbiAgY29uc3Qgc2hlZXRzID0gYXdhaXQgZ2V0R29vZ2xlU2hlZXRzQ2xpZW50KClcclxuICBjb25zdCBzcHJlYWRzaGVldElkID0gcHJvY2Vzcy5lbnYuR09PR0xFX1NIRUVUX0lEXHJcblxyXG4gIHRyeSB7XHJcbiAgICBhd2FpdCBzaGVldHMuc3ByZWFkc2hlZXRzLnZhbHVlcy5nZXQoe1xyXG4gICAgICBzcHJlYWRzaGVldElkLFxyXG4gICAgICByYW5nZTogXCJSZXN0b2NrIUExOkcxXCJcclxuICAgIH0pXHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIC8vIFNoZWV0IGRvZXNuJ3QgZXhpc3QsIGNyZWF0ZSBpdFxyXG4gICAgYXdhaXQgc2hlZXRzLnNwcmVhZHNoZWV0cy5iYXRjaFVwZGF0ZSh7XHJcbiAgICAgIHNwcmVhZHNoZWV0SWQsXHJcbiAgICAgIHJlcXVlc3RCb2R5OiB7XHJcbiAgICAgICAgcmVxdWVzdHM6IFt7XHJcbiAgICAgICAgICBhZGRTaGVldDoge1xyXG4gICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XHJcbiAgICAgICAgICAgICAgdGl0bGU6ICdSZXN0b2NrJyxcclxuICAgICAgICAgICAgICBncmlkUHJvcGVydGllczoge1xyXG4gICAgICAgICAgICAgICAgcm93Q291bnQ6IDEwMDAsXHJcbiAgICAgICAgICAgICAgICBjb2x1bW5Db3VudDogN1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1dXHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgICAvLyBBZGQgaGVhZGVyc1xyXG4gICAgYXdhaXQgc2hlZXRzLnNwcmVhZHNoZWV0cy52YWx1ZXMudXBkYXRlKHtcclxuICAgICAgc3ByZWFkc2hlZXRJZCxcclxuICAgICAgcmFuZ2U6IFwiUmVzdG9jayFBMTpHMVwiLFxyXG4gICAgICB2YWx1ZUlucHV0T3B0aW9uOiBcIlJBV1wiLFxyXG4gICAgICByZXF1ZXN0Qm9keToge1xyXG4gICAgICAgIHZhbHVlczogW1tcIklEXCIsIFwiSXRlbSBJRFwiLCBcIkl0ZW0gTmFtZVwiLCBcIlF1YW50aXR5IEFkZGVkXCIsIFwiQ29zdCBQcmljZVwiLCBcIlRvdGFsIENvc3RcIiwgXCJUaW1lc3RhbXBcIl1dXHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYWRkUmVzdG9jayhyZXN0b2NrOiBPbWl0PFJlc3RvY2ssIFwiaWRcIiB8IFwidGltZXN0YW1wXCI+KTogUHJvbWlzZTxSZXN0b2NrPiB7XHJcbiAgYXdhaXQgaW5pdGlhbGl6ZVJlc3RvY2tTaGVldCgpXHJcblxyXG4gIGNvbnN0IHNoZWV0cyA9IGF3YWl0IGdldEdvb2dsZVNoZWV0c0NsaWVudCgpXHJcbiAgY29uc3Qgc3ByZWFkc2hlZXRJZCA9IHByb2Nlc3MuZW52LkdPT0dMRV9TSEVFVF9JRFxyXG5cclxuICBjb25zdCBpZCA9IGBSU1RLLSR7RGF0ZS5ub3coKX1gXHJcbiAgY29uc3QgdGltZXN0YW1wID0gZm9ybWF0VGltZXN0YW1wKG5ldyBEYXRlKCkpXHJcblxyXG4gIGNvbnN0IHZhbHVlcyA9IFtcclxuICAgIFtcclxuICAgICAgaWQsXHJcbiAgICAgIHJlc3RvY2suaXRlbUlkLFxyXG4gICAgICByZXN0b2NrLml0ZW1OYW1lLFxyXG4gICAgICByZXN0b2NrLnF1YW50aXR5LFxyXG4gICAgICByZXN0b2NrLmNvc3RQcmljZSxcclxuICAgICAgcmVzdG9jay50b3RhbENvc3QsXHJcbiAgICAgIHRpbWVzdGFtcCxcclxuICAgIF0sXHJcbiAgXVxyXG5cclxuICBhd2FpdCBzaGVldHMuc3ByZWFkc2hlZXRzLnZhbHVlcy5hcHBlbmQoe1xyXG4gICAgc3ByZWFkc2hlZXRJZCxcclxuICAgIHJhbmdlOiBcIlJlc3RvY2shQTpHXCIsXHJcbiAgICB2YWx1ZUlucHV0T3B0aW9uOiBcIlJBV1wiLFxyXG4gICAgcmVxdWVzdEJvZHk6IHsgdmFsdWVzIH0sXHJcbiAgfSlcclxuXHJcbiAgcmV0dXJuIHsgLi4ucmVzdG9jaywgaWQsIHRpbWVzdGFtcCB9XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRSZXN0b2NrcygpOiBQcm9taXNlPFJlc3RvY2tbXT4ge1xyXG4gIGF3YWl0IGluaXRpYWxpemVSZXN0b2NrU2hlZXQoKVxyXG5cclxuICBjb25zdCBzaGVldHMgPSBhd2FpdCBnZXRHb29nbGVTaGVldHNDbGllbnQoKVxyXG4gIGNvbnN0IHNwcmVhZHNoZWV0SWQgPSBwcm9jZXNzLmVudi5HT09HTEVfU0hFRVRfSURcclxuXHJcbiAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBzaGVldHMuc3ByZWFkc2hlZXRzLnZhbHVlcy5nZXQoe1xyXG4gICAgc3ByZWFkc2hlZXRJZCxcclxuICAgIHJhbmdlOiBcIlJlc3RvY2shQTI6R1wiLFxyXG4gIH0pXHJcblxyXG4gIGNvbnN0IHJvd3MgPSByZXNwb25zZS5kYXRhLnZhbHVlcyB8fCBbXVxyXG4gIHJldHVybiByb3dzLm1hcCgocm93KSA9PiAoe1xyXG4gICAgaWQ6IHJvd1swXSB8fCBcIlwiLFxyXG4gICAgaXRlbUlkOiByb3dbMV0gfHwgXCJcIixcclxuICAgIGl0ZW1OYW1lOiByb3dbMl0gfHwgXCJcIixcclxuICAgIHF1YW50aXR5OiBOdW1iZXIucGFyc2VJbnQocm93WzNdIHx8IFwiMFwiKSxcclxuICAgIGNvc3RQcmljZTogTnVtYmVyLnBhcnNlRmxvYXQocm93WzRdIHx8IFwiMFwiKSxcclxuICAgIHRvdGFsQ29zdDogTnVtYmVyLnBhcnNlRmxvYXQocm93WzVdIHx8IFwiMFwiKSxcclxuICAgIHRpbWVzdGFtcDogcm93WzZdIHx8IFwiXCIsXHJcbiAgfSkpLnNvcnQoKGEsIGIpID0+IHBhcnNlKGIudGltZXN0YW1wLCBcInl5eXktTU0tZGQgLyBoaDptbSBhXCIsIG5ldyBEYXRlKCkpLmdldFRpbWUoKSAtIHBhcnNlKGEudGltZXN0YW1wLCBcInl5eXktTU0tZGQgLyBoaDptbSBhXCIsIG5ldyBEYXRlKCkpLmdldFRpbWUoKSlcclxufVxyXG4iXSwibmFtZXMiOlsiZ29vZ2xlIiwiZm9ybWF0IiwicGFyc2UiLCJTQ09QRVMiLCJmb3JtYXRUaW1lc3RhbXAiLCJkYXRlIiwiZ2V0R29vZ2xlU2hlZXRzQ2xpZW50IiwiYXV0aCIsIkdvb2dsZUF1dGgiLCJjcmVkZW50aWFscyIsImNsaWVudF9lbWFpbCIsInByb2Nlc3MiLCJlbnYiLCJHT09HTEVfQ0xJRU5UX0VNQUlMIiwicHJpdmF0ZV9rZXkiLCJHT09HTEVfUFJJVkFURV9LRVkiLCJyZXBsYWNlIiwic2NvcGVzIiwic2hlZXRzIiwidmVyc2lvbiIsImdldEludmVudG9yeUl0ZW1zIiwic3ByZWFkc2hlZXRJZCIsIkdPT0dMRV9TSEVFVF9JRCIsInJlc3BvbnNlIiwic3ByZWFkc2hlZXRzIiwidmFsdWVzIiwiZ2V0IiwicmFuZ2UiLCJyb3dzIiwiZGF0YSIsIm1hcCIsInJvdyIsImlkIiwibmFtZSIsInNrdSIsImNhdGVnb3J5IiwicXVhbnRpdHkiLCJOdW1iZXIiLCJwYXJzZUludCIsImNvc3RQcmljZSIsInBhcnNlRmxvYXQiLCJzZWxsaW5nUHJpY2UiLCJyZW9yZGVyTGV2ZWwiLCJzdXBwbGllciIsImxhc3RVcGRhdGVkIiwiRGF0ZSIsImFkZEludmVudG9yeUl0ZW0iLCJpdGVtIiwibm93IiwiYXBwZW5kIiwidmFsdWVJbnB1dE9wdGlvbiIsInJlcXVlc3RCb2R5IiwidXBkYXRlSW52ZW50b3J5SXRlbSIsInVwZGF0ZXMiLCJpdGVtcyIsImluZGV4IiwiZmluZEluZGV4IiwiRXJyb3IiLCJyb3dOdW1iZXIiLCJmaWVsZFRvQ29sdW1uIiwicmVxdWVzdHMiLCJrZXkiLCJ2YWx1ZSIsIk9iamVjdCIsImVudHJpZXMiLCJmaWVsZEtleSIsImNvbCIsInVuZGVmaW5lZCIsInVzZXJFbnRlcmVkVmFsdWUiLCJudW1iZXJWYWx1ZSIsInN0cmluZ1ZhbHVlIiwicHVzaCIsInVwZGF0ZUNlbGxzIiwic2hlZXRJZCIsInN0YXJ0Um93SW5kZXgiLCJlbmRSb3dJbmRleCIsInN0YXJ0Q29sdW1uSW5kZXgiLCJlbmRDb2x1bW5JbmRleCIsImZpZWxkcyIsImxlbmd0aCIsImJhdGNoVXBkYXRlIiwiZGVsZXRlSW52ZW50b3J5SXRlbSIsImRlbGV0ZURpbWVuc2lvbiIsImRpbWVuc2lvbiIsInN0YXJ0SW5kZXgiLCJlbmRJbmRleCIsImFkZFRyYW5zYWN0aW9uIiwidHJhbnNhY3Rpb24iLCJ0aW1lc3RhbXAiLCJpdGVtSWQiLCJpdGVtTmFtZSIsInRvdGFsQ29zdCIsInRvdGFsUmV2ZW51ZSIsInByb2ZpdCIsInR5cGUiLCJwYXltZW50TWV0aG9kIiwicmVmZXJlbmNlTnVtYmVyIiwiZ2V0VHJhbnNhY3Rpb25zIiwiaW5pdGlhbGl6ZUxvZ3NTaGVldCIsImVycm9yIiwiYWRkU2hlZXQiLCJwcm9wZXJ0aWVzIiwidGl0bGUiLCJncmlkUHJvcGVydGllcyIsInJvd0NvdW50IiwiY29sdW1uQ291bnQiLCJ1cGRhdGUiLCJhZGRMb2ciLCJsb2ciLCJvcGVyYXRpb24iLCJkZXRhaWxzIiwiZ2V0TG9ncyIsInNvcnQiLCJhIiwiYiIsImdldFRpbWUiLCJpbml0aWFsaXplUmVzdG9ja1NoZWV0IiwiYWRkUmVzdG9jayIsInJlc3RvY2siLCJnZXRSZXN0b2NrcyJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./lib/google-sheets.ts\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fitems%2Froute&page=%2Fapi%2Fitems%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fitems%2Froute.ts&appDir=C%3A%5CInventory%20Management%20System%5CInventory-Management-System%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CInventory%20Management%20System%5CInventory-Management-System&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!*****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fitems%2Froute&page=%2Fapi%2Fitems%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fitems%2Froute.ts&appDir=C%3A%5CInventory%20Management%20System%5CInventory-Management-System%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CInventory%20Management%20System%5CInventory-Management-System&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \*****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/./node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var C_Inventory_Management_System_Inventory_Management_System_app_api_items_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/items/route.ts */ \"(rsc)/./app/api/items/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/items/route\",\n        pathname: \"/api/items\",\n        filename: \"route\",\n        bundlePath: \"app/api/items/route\"\n    },\n    resolvedPagePath: \"C:\\\\Inventory Management System\\\\Inventory-Management-System\\\\app\\\\api\\\\items\\\\route.ts\",\n    nextConfigOutput,\n    userland: C_Inventory_Management_System_Inventory_Management_System_app_api_items_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        workAsyncStorage,\n        workUnitAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIvaW5kZXguanM/bmFtZT1hcHAlMkZhcGklMkZpdGVtcyUyRnJvdXRlJnBhZ2U9JTJGYXBpJTJGaXRlbXMlMkZyb3V0ZSZhcHBQYXRocz0mcGFnZVBhdGg9cHJpdmF0ZS1uZXh0LWFwcC1kaXIlMkZhcGklMkZpdGVtcyUyRnJvdXRlLnRzJmFwcERpcj1DJTNBJTVDSW52ZW50b3J5JTIwTWFuYWdlbWVudCUyMFN5c3RlbSU1Q0ludmVudG9yeS1NYW5hZ2VtZW50LVN5c3RlbSU1Q2FwcCZwYWdlRXh0ZW5zaW9ucz10c3gmcGFnZUV4dGVuc2lvbnM9dHMmcGFnZUV4dGVuc2lvbnM9anN4JnBhZ2VFeHRlbnNpb25zPWpzJnJvb3REaXI9QyUzQSU1Q0ludmVudG9yeSUyME1hbmFnZW1lbnQlMjBTeXN0ZW0lNUNJbnZlbnRvcnktTWFuYWdlbWVudC1TeXN0ZW0maXNEZXY9dHJ1ZSZ0c2NvbmZpZ1BhdGg9dHNjb25maWcuanNvbiZiYXNlUGF0aD0mYXNzZXRQcmVmaXg9Jm5leHRDb25maWdPdXRwdXQ9JnByZWZlcnJlZFJlZ2lvbj0mbWlkZGxld2FyZUNvbmZpZz1lMzAlM0QhIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQStGO0FBQ3ZDO0FBQ3FCO0FBQ3VDO0FBQ3BIO0FBQ0E7QUFDQTtBQUNBLHdCQUF3Qix5R0FBbUI7QUFDM0M7QUFDQSxjQUFjLGtFQUFTO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxZQUFZO0FBQ1osQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBLFFBQVEsc0RBQXNEO0FBQzlEO0FBQ0EsV0FBVyw0RUFBVztBQUN0QjtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQzBGOztBQUUxRiIsInNvdXJjZXMiOlsiIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFwcFJvdXRlUm91dGVNb2R1bGUgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9yb3V0ZS1tb2R1bGVzL2FwcC1yb3V0ZS9tb2R1bGUuY29tcGlsZWRcIjtcbmltcG9ydCB7IFJvdXRlS2luZCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL3JvdXRlLWtpbmRcIjtcbmltcG9ydCB7IHBhdGNoRmV0Y2ggYXMgX3BhdGNoRmV0Y2ggfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9saWIvcGF0Y2gtZmV0Y2hcIjtcbmltcG9ydCAqIGFzIHVzZXJsYW5kIGZyb20gXCJDOlxcXFxJbnZlbnRvcnkgTWFuYWdlbWVudCBTeXN0ZW1cXFxcSW52ZW50b3J5LU1hbmFnZW1lbnQtU3lzdGVtXFxcXGFwcFxcXFxhcGlcXFxcaXRlbXNcXFxccm91dGUudHNcIjtcbi8vIFdlIGluamVjdCB0aGUgbmV4dENvbmZpZ091dHB1dCBoZXJlIHNvIHRoYXQgd2UgY2FuIHVzZSB0aGVtIGluIHRoZSByb3V0ZVxuLy8gbW9kdWxlLlxuY29uc3QgbmV4dENvbmZpZ091dHB1dCA9IFwiXCJcbmNvbnN0IHJvdXRlTW9kdWxlID0gbmV3IEFwcFJvdXRlUm91dGVNb2R1bGUoe1xuICAgIGRlZmluaXRpb246IHtcbiAgICAgICAga2luZDogUm91dGVLaW5kLkFQUF9ST1VURSxcbiAgICAgICAgcGFnZTogXCIvYXBpL2l0ZW1zL3JvdXRlXCIsXG4gICAgICAgIHBhdGhuYW1lOiBcIi9hcGkvaXRlbXNcIixcbiAgICAgICAgZmlsZW5hbWU6IFwicm91dGVcIixcbiAgICAgICAgYnVuZGxlUGF0aDogXCJhcHAvYXBpL2l0ZW1zL3JvdXRlXCJcbiAgICB9LFxuICAgIHJlc29sdmVkUGFnZVBhdGg6IFwiQzpcXFxcSW52ZW50b3J5IE1hbmFnZW1lbnQgU3lzdGVtXFxcXEludmVudG9yeS1NYW5hZ2VtZW50LVN5c3RlbVxcXFxhcHBcXFxcYXBpXFxcXGl0ZW1zXFxcXHJvdXRlLnRzXCIsXG4gICAgbmV4dENvbmZpZ091dHB1dCxcbiAgICB1c2VybGFuZFxufSk7XG4vLyBQdWxsIG91dCB0aGUgZXhwb3J0cyB0aGF0IHdlIG5lZWQgdG8gZXhwb3NlIGZyb20gdGhlIG1vZHVsZS4gVGhpcyBzaG91bGRcbi8vIGJlIGVsaW1pbmF0ZWQgd2hlbiB3ZSd2ZSBtb3ZlZCB0aGUgb3RoZXIgcm91dGVzIHRvIHRoZSBuZXcgZm9ybWF0LiBUaGVzZVxuLy8gYXJlIHVzZWQgdG8gaG9vayBpbnRvIHRoZSByb3V0ZS5cbmNvbnN0IHsgd29ya0FzeW5jU3RvcmFnZSwgd29ya1VuaXRBc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzIH0gPSByb3V0ZU1vZHVsZTtcbmZ1bmN0aW9uIHBhdGNoRmV0Y2goKSB7XG4gICAgcmV0dXJuIF9wYXRjaEZldGNoKHtcbiAgICAgICAgd29ya0FzeW5jU3RvcmFnZSxcbiAgICAgICAgd29ya1VuaXRBc3luY1N0b3JhZ2VcbiAgICB9KTtcbn1cbmV4cG9ydCB7IHJvdXRlTW9kdWxlLCB3b3JrQXN5bmNTdG9yYWdlLCB3b3JrVW5pdEFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MsIHBhdGNoRmV0Y2gsICB9O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1hcHAtcm91dGUuanMubWFwIl0sIm5hbWVzIjpbXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fitems%2Froute&page=%2Fapi%2Fitems%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fitems%2Froute.ts&appDir=C%3A%5CInventory%20Management%20System%5CInventory-Management-System%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CInventory%20Management%20System%5CInventory-Management-System&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "(ssr)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
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
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/googleapis","vendor-chunks/next","vendor-chunks/google-auth-library","vendor-chunks/date-fns","vendor-chunks/bignumber.js","vendor-chunks/googleapis-common","vendor-chunks/gaxios","vendor-chunks/qs","vendor-chunks/json-bigint","vendor-chunks/gtoken","vendor-chunks/google-logging-utils","vendor-chunks/gcp-metadata","vendor-chunks/object-inspect","vendor-chunks/get-intrinsic","vendor-chunks/jws","vendor-chunks/jwa","vendor-chunks/url-template","vendor-chunks/ecdsa-sig-formatter","vendor-chunks/base64-js","vendor-chunks/side-channel-list","vendor-chunks/extend","vendor-chunks/side-channel-weakmap","vendor-chunks/has-symbols","vendor-chunks/function-bind","vendor-chunks/side-channel-map","vendor-chunks/safe-buffer","vendor-chunks/side-channel","vendor-chunks/get-proto","vendor-chunks/call-bind-apply-helpers","vendor-chunks/buffer-equal-constant-time","vendor-chunks/dunder-proto","vendor-chunks/math-intrinsics","vendor-chunks/call-bound","vendor-chunks/es-errors","vendor-chunks/gopd","vendor-chunks/es-define-property","vendor-chunks/hasown","vendor-chunks/es-object-atoms"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fitems%2Froute&page=%2Fapi%2Fitems%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fitems%2Froute.ts&appDir=C%3A%5CInventory%20Management%20System%5CInventory-Management-System%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CInventory%20Management%20System%5CInventory-Management-System&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();