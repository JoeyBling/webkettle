package org.flhy.webapp.trans.steps.scriptvalues_mod;

import java.awt.Font;
import java.awt.FontMetrics;
import java.awt.Toolkit;
import java.math.BigDecimal;
import java.util.Collections;
import java.util.Date;
import java.util.Hashtable;
import java.util.List;
import java.util.Vector;

import org.flhy.ext.PluginFactory;
import org.flhy.ext.base.GraphCodec;
import org.flhy.ext.trans.steps.RowGenerator;
import org.flhy.ext.utils.JSONArray;
import org.flhy.ext.utils.JSONObject;
import org.flhy.ext.utils.JsonUtils;
import org.flhy.webapp.utils.SearchFieldsProgress;
import org.flhy.webapp.utils.TransPreviewProgress;
import org.mozilla.javascript.CompilerEnvirons;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.ContextFactory;
import org.mozilla.javascript.ErrorReporter;
import org.mozilla.javascript.NodeTransformer;
import org.mozilla.javascript.Parser;
import org.mozilla.javascript.Script;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.ScriptableObject;
import org.mozilla.javascript.ast.ScriptNode;
import org.mozilla.javascript.tools.ToolErrorReporter;
import org.pentaho.di.compatibility.Row;
import org.pentaho.di.compatibility.Value;
import org.pentaho.di.core.Const;
import org.pentaho.di.core.row.RowMeta;
import org.pentaho.di.core.row.RowMetaInterface;
import org.pentaho.di.core.row.ValueMeta;
import org.pentaho.di.core.row.ValueMetaInterface;
import org.pentaho.di.i18n.BaseMessages;
import org.pentaho.di.trans.TransHopMeta;
import org.pentaho.di.trans.TransMeta;
import org.pentaho.di.trans.step.StepMeta;
import org.pentaho.di.trans.steps.rowgenerator.RowGeneratorMeta;
import org.pentaho.di.trans.steps.scriptvalues_mod.ScriptValuesAddedFunctions;
import org.pentaho.di.trans.steps.scriptvalues_mod.ScriptValuesMetaMod;
import org.pentaho.di.trans.steps.scriptvalues_mod.ScriptValuesModDummy;
import org.pentaho.di.trans.steps.scriptvalues_mod.ScriptValuesScript;
import org.pentaho.di.ui.trans.steps.scriptvalues_mod.ScriptValuesHelp;
import org.springframework.stereotype.Controller;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import com.mxgraph.model.mxCell;
import com.mxgraph.model.mxGeometry;
import com.mxgraph.util.mxUtils;

@Controller
@RequestMapping(value="/script")
public class ScriptValuesModController {

	@ResponseBody
	@RequestMapping(method=RequestMethod.POST, value="/tree")
	protected void tree(@RequestParam String graphXml, @RequestParam String stepName) throws Exception {
		GraphCodec codec = (GraphCodec) PluginFactory.getBean(GraphCodec.TRANS_CODEC);
		TransMeta transMeta = (TransMeta) codec.decode(graphXml);
		StepMeta stepMeta = transMeta.findStep(stepName);
		ScriptValuesMetaMod input = (ScriptValuesMetaMod) stepMeta.getStepMetaInterface();
		JSONArray jsonArray = new JSONArray();
		
		int count = 1;
		JSONObject transScripts = new JSONObject();
		transScripts.put("id", count++);
		transScripts.put("text",  BaseMessages.getString( ScriptValuesMetaMod.class, "ScriptValuesDialogMod.TransformScript.Label" ));
		transScripts.put("expanded", true);
		
		JSONObject transCons = new JSONObject();
		transCons.put("id", count++);
		transCons.put("text",  BaseMessages.getString( ScriptValuesMetaMod.class, "ScriptValuesDialogMod.TansformConstant.Label" ));
			
		JSONObject transFuncs = new JSONObject();
		transFuncs.put("id", count++);
		transFuncs.put("text",  BaseMessages.getString( ScriptValuesMetaMod.class, "ScriptValuesDialogMod.TransformFunctions.Label" ));
		
		JSONObject transInputs = new JSONObject();
		transInputs.put("id", count++);
		transInputs.put("text",  BaseMessages.getString( ScriptValuesMetaMod.class, "ScriptValuesDialogMod.InputFields.Label" ));
		transInputs.put("expanded", true);
		
		JSONObject transOutputs = new JSONObject();
		transOutputs.put("id", count++);
		transOutputs.put("text",  BaseMessages.getString( ScriptValuesMetaMod.class, "ScriptValuesDialogMod.OutputFields.Label" ));
		transOutputs.put("children", new JSONArray());
		
		// fill transforms
		JSONArray items = new JSONArray();
		for(String name : input.getJSScriptNames()) {
			JSONObject jsonObject = new JSONObject();
			jsonObject.put("id", count++);
			jsonObject.put("text",  name);
			jsonObject.put("iconCls",  "activeScript");
			jsonObject.put("leaf", true);
			items.add(jsonObject);
		}
		transScripts.put("children", items);
		
		// fill constants
		items = new JSONArray();
		for(String text : new String[]{"SKIP_TRANSFORMATION", "ERROR_TRANSFORMATION",  "CONTINUE_TRANSFORMATION"}) {
			JSONObject jsonObject = new JSONObject();
			jsonObject.put("id", count++);
			jsonObject.put("text",  text);
			jsonObject.put("iconCls",  "arrowGreen");
			jsonObject.put("leaf", true);
			items.add(jsonObject);
		}
		transCons.put("children", items);
		
		// fill functions
		Hashtable<String, String> hatFunctions = scVHelp.getFunctionList();
	    Vector<String> v = new Vector<String>( hatFunctions.keySet() );
	    Collections.sort( v );

	    JSONArray stringFuncs = new JSONArray();
	    JSONArray numberFuncs = new JSONArray();
	    JSONArray dateFuncs = new JSONArray();
	    JSONArray logicFuncs = new JSONArray();
	    JSONArray specialFuncs = new JSONArray();
	    JSONArray fileFuncs = new JSONArray();
	    for ( String strFunction : v ) {
	    	String strFunctionType = hatFunctions.get( strFunction );
	    	int iFunctionType = Integer.valueOf( strFunctionType ).intValue();
	    	JSONObject jsonObject = new JSONObject();
	    	jsonObject.put("id", count++);
	    	jsonObject.put("text", strFunction);
	    	jsonObject.put("iconCls",  "arrowGreen");
	    	jsonObject.put("leaf", true);
	    	
			switch (iFunctionType) {
			case ScriptValuesAddedFunctions.STRING_FUNCTION:
				stringFuncs.add(jsonObject);
				break;
			case ScriptValuesAddedFunctions.NUMERIC_FUNCTION:
				numberFuncs.add(jsonObject);
				break;
			case ScriptValuesAddedFunctions.DATE_FUNCTION:
				dateFuncs.add(jsonObject);
				break;
			case ScriptValuesAddedFunctions.LOGIC_FUNCTION:
				logicFuncs.add(jsonObject);
				break;
			case ScriptValuesAddedFunctions.SPECIAL_FUNCTION:
				specialFuncs.add(jsonObject);
				break;
			case ScriptValuesAddedFunctions.FILE_FUNCTION:
				fileFuncs.add(jsonObject);
				break;
			default:
				break;
			}
	    }
	    
	    items = new JSONArray();
	    JSONObject stringFunc = new JSONObject();
	    stringFunc.put("id", count++);
	    stringFunc.put("text",  BaseMessages.getString( ScriptValuesMetaMod.class, "ScriptValuesDialogMod.StringFunctions.Label" ));
	    stringFunc.put("iconCls",  "underGreen");
	    stringFunc.put("children", stringFuncs);
	    items.add(stringFunc);
	    
	    JSONObject numberFunc = new JSONObject();
	    numberFunc.put("id", count++);
	    numberFunc.put("text",  BaseMessages.getString( ScriptValuesMetaMod.class, "ScriptValuesDialogMod.NumericFunctions.Label" ));
	    numberFunc.put("iconCls",  "underGreen");
	    numberFunc.put("children", numberFuncs);
	    items.add(numberFunc);
	    
	    JSONObject dateFunc = new JSONObject();
	    dateFunc.put("id", count++);
	    dateFunc.put("text",  BaseMessages.getString( ScriptValuesMetaMod.class, "ScriptValuesDialogMod.DateFunctions.Label" ));
	    dateFunc.put("iconCls",  "underGreen");
	    dateFunc.put("children", dateFuncs);
	    items.add(dateFunc);
	    
	    JSONObject logicFunc = new JSONObject();
	    logicFunc.put("id", count++);
	    logicFunc.put("text",  BaseMessages.getString( ScriptValuesMetaMod.class, "ScriptValuesDialogMod.LogicFunctions.Label" ));
	    logicFunc.put("iconCls",  "underGreen");
	    logicFunc.put("children", logicFuncs);
	    items.add(logicFunc);
	    
	    JSONObject fileFunc = new JSONObject();
	    fileFunc.put("id", count++);
	    fileFunc.put("text",  BaseMessages.getString( ScriptValuesMetaMod.class, "ScriptValuesDialogMod.FileFunctions.Label" ));
	    fileFunc.put("iconCls",  "underGreen");
	    fileFunc.put("children", fileFuncs);
	    items.add(fileFunc);
	    
	    transFuncs.put("children", items);
	    // end fill functions
	    
	    // fill input fields
	    SearchFieldsProgress op = new SearchFieldsProgress( transMeta, stepMeta, true );
		op.run();
		RowMetaInterface rowMetaInterface = op.getFields();
		
		items = new JSONArray();
		for (int i = 0; i < rowMetaInterface.size(); i++) {
			ValueMetaInterface valueMeta = rowMetaInterface.getValueMeta(i);
			JSONObject jsonObject = new JSONObject();
			jsonObject.put("id", count++);
			jsonObject.put("text",  valueMeta.getName());
			jsonObject.put("iconCls",  "arrowOrange");
			jsonObject.put("leaf", true);
			items.add(jsonObject);
		}
		transInputs.put("children", items);
	    
		jsonArray.add(transScripts);
		jsonArray.add(transCons);
		jsonArray.add(transFuncs);
		jsonArray.add(transInputs);
		jsonArray.add(transOutputs);
		JsonUtils.response(jsonArray);
	}
	
	private static ScriptValuesHelp scVHelp;
	static {
		try {
			scVHelp = new ScriptValuesHelp("jsFunctionHelp.xml");
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	
	@ResponseBody
	@RequestMapping(method = RequestMethod.POST, value = "/getVariables")
	protected void getVariables(@RequestParam String graphXml, @RequestParam String stepName,  @RequestParam String scriptName) throws Exception {
		GraphCodec codec = (GraphCodec) PluginFactory.getBean(GraphCodec.TRANS_CODEC);
		TransMeta transMeta = (TransMeta) codec.decode(graphXml);
		ScriptValuesMetaMod input = (ScriptValuesMetaMod) transMeta.findStep(stepName).getStepMetaInterface();
		
		Context jscx = ContextFactory.getGlobal().enterContext();
		jscx.setOptimizationLevel(-1);
		Scriptable jsscope = jscx.initStandardObjects(null, false);
		
		String strStartScript = null, scr = null;
		for(ScriptValuesScript script : input.getJSScripts()) {
			Scriptable jsR = Context.toObject(script.getScript(), jsscope);
			jsscope.put(script.getScriptName(), jsscope, jsR);
			
			if(script.isStartScript())
				strStartScript = script.getScript();
			if(script.getScriptName().equals(scriptName))
				scr = script.getScript();
		}
		
		jsscope.put( "_TransformationName_", jsscope, stepName);
		RowMetaInterface rowMeta = transMeta.getPrevStepFields( stepName );
		if(rowMeta != null) {

			ScriptValuesModDummy dummyStep = new ScriptValuesModDummy(rowMeta, transMeta.getStepFields(stepName));
			Scriptable jsvalue = Context.toObject(dummyStep, jsscope);
			jsscope.put("_step_", jsscope, jsvalue);

			if (input.getAddClasses() != null) {
				for (int i = 0; i < input.getAddClasses().length; i++) {
					Object jsOut = Context.javaToJS(input.getAddClasses()[i].getAddObject(), jsscope);
					ScriptableObject.putProperty(jsscope, input.getAddClasses()[i].getJSName(), jsOut);
				}
			}

			Context.javaToJS(ScriptValuesAddedFunctions.class, jsscope);
			((ScriptableObject) jsscope).defineFunctionProperties(ScriptValuesAddedFunctions.jsFunctionList, ScriptValuesAddedFunctions.class, ScriptableObject.DONTENUM);

			jsscope.put("SKIP_TRANSFORMATION", jsscope, Integer.valueOf(1));
			jsscope.put("ABORT_TRANSFORMATION", jsscope, Integer.valueOf(-1));
			jsscope.put("ERROR_TRANSFORMATION", jsscope, Integer.valueOf(-2));
			jsscope.put("CONTINUE_TRANSFORMATION", jsscope, Integer.valueOf(0));

			Object[] row = new Object[rowMeta.size()];
			Scriptable jsRowMeta = Context.toObject(rowMeta, jsscope);
			jsscope.put("rowMeta", jsscope, jsRowMeta);
			for (int i = 0; i < rowMeta.size(); i++) {
				ValueMetaInterface valueMeta = rowMeta.getValueMeta(i);
				Object valueData = null;

				if (valueMeta.isDate()) {
					valueData = new Date();
				}
				if (valueMeta.isString()) {
					valueData = "test value test value test value test value test value " + "test value test value test value test value test value";
				}
				if (valueMeta.isInteger()) {
					valueData = Long.valueOf(0L);
				}
				if (valueMeta.isNumber()) {
					valueData = new Double(0.0);
				}
				if (valueMeta.isBigNumber()) {
					valueData = BigDecimal.ZERO;
				}
				if (valueMeta.isBoolean()) {
					valueData = Boolean.TRUE;
				}
				if (valueMeta.isBinary()) {
					valueData = new byte[] { 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, };
				}

				if (valueMeta.isStorageBinaryString()) {
					valueMeta.setStorageType(ValueMetaInterface.STORAGE_TYPE_NORMAL);
				}

				row[i] = valueData;

				if (input.isCompatible()) {
					Value value = valueMeta.createOriginalValue(valueData);
					Scriptable jsarg = Context.toObject(value, jsscope);
					jsscope.put(valueMeta.getName(), jsscope, jsarg);
				} else {
					Scriptable jsarg = Context.toObject(valueData, jsscope);
					jsscope.put(valueMeta.getName(), jsscope, jsarg);
				}
			}


			Scriptable jsval = Context.toObject(Value.class, jsscope);
			jsscope.put("Value", jsscope, jsval);

			if (input.isCompatible()) {
				Row v2Row = RowMeta.createOriginalRow(rowMeta, row);
				Scriptable jsV2Row = Context.toObject(v2Row, jsscope);
				jsscope.put("row", jsscope, jsV2Row);
			} else {
				Scriptable jsRow = Context.toObject(row, jsscope);
				jsscope.put("row", jsscope, jsRow);
			}

			if (strStartScript != null) {
				jscx.evaluateString(jsscope, strStartScript, "trans_Start", 1, null);
			}


			Script evalScript = jscx.compileString(scr, "script", 1, null);
			evalScript.exec(jscx, jsscope);

			CompilerEnvirons evn = new CompilerEnvirons();
			evn.setOptimizationLevel(-1);
			evn.setGeneratingSource(true);
			evn.setGenerateDebugInfo(true);
			ErrorReporter errorReporter = new ToolErrorReporter(false);
			Parser p = new Parser(evn, errorReporter);
			ScriptNode tree = p.parse(scr, "", 0);
			new NodeTransformer().transform(tree);
	          
			JSONArray jsonArray = new JSONArray();
			for (int i = 0; i < tree.getParamAndVarCount(); i++) {
				String varname = tree.getParamOrVarName(i);
				if (!varname.equalsIgnoreCase("row") && !varname.equalsIgnoreCase("trans_Status")) {
					int type = ValueMetaInterface.TYPE_STRING;
					int length = -1, precision = -1;
					Object result = jsscope.get(varname, jsscope);
					if (result != null) {
						String classname = result.getClass().getName();
						if (classname.equalsIgnoreCase("java.lang.Byte")) {
							// MAX = 127
							type = ValueMetaInterface.TYPE_INTEGER;
							length = 3;
							precision = 0;
						} else if (classname.equalsIgnoreCase("java.lang.Integer")) {
							// MAX = 2147483647
							type = ValueMetaInterface.TYPE_INTEGER;
							length = 9;
							precision = 0;
						} else if (classname.equalsIgnoreCase("java.lang.Long")) {
							// MAX = 9223372036854775807
							type = ValueMetaInterface.TYPE_INTEGER;
							length = 18;
							precision = 0;
						} else if (classname.equalsIgnoreCase("java.lang.Double")) {
							type = ValueMetaInterface.TYPE_NUMBER;
							length = 16;
							precision = 2;

						} else if (classname.equalsIgnoreCase("org.mozilla.javascript.NativeDate") || classname.equalsIgnoreCase("java.util.Date")) {
							type = ValueMetaInterface.TYPE_DATE;
						} else if (classname.equalsIgnoreCase("java.lang.Boolean")) {
							type = ValueMetaInterface.TYPE_BOOLEAN;
						}
					}

					JSONObject jsonObject = new JSONObject();
					jsonObject.put("name", varname);
					jsonObject.put("rename", "");
					jsonObject.put("type", ValueMeta.getTypeDesc(type));
					jsonObject.put("length", length >= 0 ? String.valueOf(length) : "");
					jsonObject.put("precision", precision >= 0 ? String.valueOf(precision) : "");
					jsonObject.put("replace", (rowMeta.indexOfValue(varname) >= 0) ? "Y" : "N");
					jsonArray.add(jsonObject);
				}

			}
			
			JsonUtils.response(jsonArray);
		}
	}
	
	@ResponseBody
	@RequestMapping(method = RequestMethod.POST, value = "/testData")
	protected void testData(@RequestParam String graphXml, @RequestParam String stepName) throws Exception {
		GraphCodec codec = (GraphCodec) PluginFactory.getBean(GraphCodec.TRANS_CODEC);
		TransMeta transMeta = (TransMeta) codec.decode(graphXml);
		
		RowMetaInterface rowMeta = transMeta.getPrevStepFields(stepName).clone();
		if (rowMeta != null) {
			RowGeneratorMeta genMeta = new RowGeneratorMeta();
			genMeta.setRowLimit("10");
			genMeta.allocate(rowMeta.size());
			for (int i = 0; i < rowMeta.size(); i++) {
				ValueMetaInterface valueMeta = rowMeta.getValueMeta(i);
				if (valueMeta.isStorageBinaryString()) {
					valueMeta.setStorageType(ValueMetaInterface.STORAGE_TYPE_NORMAL);
				}
				genMeta.getFieldName()[i] = valueMeta.getName();
				genMeta.getFieldType()[i] = valueMeta.getTypeDesc();
				genMeta.getFieldLength()[i] = valueMeta.getLength();
				genMeta.getFieldPrecision()[i] = valueMeta.getPrecision();
				genMeta.getCurrency()[i] = valueMeta.getCurrencySymbol();
				genMeta.getDecimal()[i] = valueMeta.getDecimalSymbol();
				genMeta.getGroup()[i] = valueMeta.getGroupingSymbol();

				String string = null;
				switch (valueMeta.getType()) {
				case ValueMetaInterface.TYPE_DATE:
					genMeta.getFieldFormat()[i] = "yyyy/MM/dd HH:mm:ss";
					valueMeta.setConversionMask(genMeta.getFieldFormat()[i]);
					string = valueMeta.getString(new Date());
					break;
				case ValueMetaInterface.TYPE_STRING:
					string = "test value test value";
					break;
				case ValueMetaInterface.TYPE_INTEGER:
					genMeta.getFieldFormat()[i] = "#";
					valueMeta.setConversionMask(genMeta.getFieldFormat()[i]);
					string = valueMeta.getString(Long.valueOf(0L));
					break;
				case ValueMetaInterface.TYPE_NUMBER:
					genMeta.getFieldFormat()[i] = "#.#";
					valueMeta.setConversionMask(genMeta.getFieldFormat()[i]);
					string = valueMeta.getString(Double.valueOf(0.0D));
					break;
				case ValueMetaInterface.TYPE_BIGNUMBER:
					genMeta.getFieldFormat()[i] = "#.#";
					valueMeta.setConversionMask(genMeta.getFieldFormat()[i]);
					string = valueMeta.getString(BigDecimal.ZERO);
					break;
				case ValueMetaInterface.TYPE_BOOLEAN:
					string = valueMeta.getString(Boolean.TRUE);
					break;
				case ValueMetaInterface.TYPE_BINARY:
					string = valueMeta.getString(new byte[] { 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, });
					break;
				default:
					break;
				}

				genMeta.getValue()[i] = string;
			}
			
			RowGenerator rg = (RowGenerator) PluginFactory.getBean("RowGenerator");
			Element e = rg.encode(genMeta);
			e.setAttribute("label", "## TEST DATA ##");
			e.setAttribute("ctype", "RowGenerator");
			e.setAttribute("copies", "1");
			
			JsonUtils.responseXml(mxUtils.getXml(e));
		}
	}
	
	@ResponseBody
	@RequestMapping(method = RequestMethod.POST, value = "/test")
	protected void test(@RequestParam String graphXml, @RequestParam String stepName, @RequestParam String rowGenerator) throws Exception {
		GraphCodec codec = (GraphCodec) PluginFactory.getBean(GraphCodec.TRANS_CODEC);
		TransMeta transMeta = (TransMeta) codec.decode(graphXml);
		StepMeta scriptStep = transMeta.findStep(stepName);
		
		Document doc = mxUtils.parseXml(rowGenerator);
		
		RowGenerator rg = (RowGenerator) PluginFactory.getBean("RowGenerator");
		mxCell cell = new mxCell(doc.getDocumentElement());
		cell.setGeometry(new mxGeometry(0, 0, 40, 40));
		StepMeta genStep = rg.decodeStep(cell, null, null);
		RowGeneratorMeta genMeta = (RowGeneratorMeta) genStep.getStepMetaInterface();
		
		// Create a hop between both steps...
		//
		TransHopMeta hop = new TransHopMeta(genStep, scriptStep);

		// Generate a new test transformation...
		//
		TransMeta newMeta = new TransMeta();
		newMeta.setName(stepName + " - PREVIEW");
		newMeta.addStep(genStep);
		newMeta.addStep(scriptStep);
		newMeta.addTransHop(hop);
		
		int rowLimit = Const.toInt( genMeta.getRowLimit(), 10 );
		TransPreviewProgress tpp = new TransPreviewProgress(newMeta, new String[] { stepName}, new int[] { rowLimit });
		RowMetaInterface rowMeta = tpp.getPreviewRowsMeta(stepName);
		List<Object[]> rowsData = tpp.getPreviewRows(stepName);
		
		Font f = new Font("Arial", Font.PLAIN, 12);
		FontMetrics fm = Toolkit.getDefaultToolkit().getFontMetrics(f);
			
		if (rowMeta != null) {
			JSONObject jsonObject = new JSONObject();
			List<ValueMetaInterface> valueMetas = rowMeta.getValueMetaList();
			
			int width = 0;
			JSONArray columns = new JSONArray();
			JSONObject metaData = new JSONObject();
			JSONArray fields = new JSONArray();
			for (int i = 0; i < valueMetas.size(); i++) {
				ValueMetaInterface valueMeta = rowMeta.getValueMeta(i);
				fields.add(valueMeta.getName());
				String header = valueMeta.getComments() == null ? valueMeta.getName() : valueMeta.getComments();
				
				int hWidth = fm.stringWidth(header) + 10;
				width += hWidth;
				JSONObject column = new JSONObject();
				column.put("dataIndex", valueMeta.getName());
				column.put("header", header);
				column.put("width", hWidth);
				columns.add(column);
			}
			metaData.put("fields", fields);
			metaData.put("root", "firstRecords");
			
			JSONArray firstRecords = new JSONArray();
			for (int rowNr = 0; rowNr < rowsData.size(); rowNr++) {
				Object[] rowData = rowsData.get(rowNr);
				JSONObject row = new JSONObject();
				for (int colNr = 0; colNr < rowMeta.size(); colNr++) {
					String string = null;
					ValueMetaInterface valueMetaInterface;
					try {
						valueMetaInterface = rowMeta.getValueMeta(colNr);
						if (valueMetaInterface.isStorageBinaryString()) {
							Object nativeType = valueMetaInterface.convertBinaryStringToNativeType((byte[]) rowData[colNr]);
							string = valueMetaInterface.getStorageMetadata().getString(nativeType);
						} else {
							string = rowMeta.getString(rowData, colNr);
						}
					} catch (Exception e) {
						e.printStackTrace();
					}
					if(!StringUtils.hasText(string))
						string = "&lt;null&gt;";
					
					ValueMetaInterface valueMeta = rowMeta.getValueMeta( colNr );
					row.put(valueMeta.getName(), string);
				}
				if(firstRecords.size() <= rowLimit) {
					firstRecords.add(row);
				}
			}
			
			jsonObject.put("metaData", metaData);
			jsonObject.put("columns", columns);
			jsonObject.put("firstRecords", firstRecords);
			jsonObject.put("width", width < 1000 ? width : 1000);
			
			JsonUtils.response(jsonObject);
		}
	}
	
}
