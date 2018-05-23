package org.flhy.ext.core.row;

import org.flhy.ext.utils.JSONObject;
import org.pentaho.di.core.Const;
import org.pentaho.di.core.exception.KettleValueException;
import org.pentaho.di.core.row.ValueMeta;
import org.pentaho.di.core.row.ValueMetaAndData;
import org.pentaho.di.core.row.ValueMetaInterface;
import org.pentaho.di.core.row.value.ValueMetaBase;

public class ValueMetaAndDataCodec {

	public static JSONObject encode(ValueMetaAndData valueMetaAndData) throws KettleValueException {
		JSONObject jsonObject = new JSONObject();
		ValueMetaInterface meta = valueMetaAndData.getValueMeta().clone();
	    meta.setDecimalSymbol( "." );
	    meta.setGroupingSymbol( null );
	    meta.setCurrencySymbol( null );

	    jsonObject.put("name", meta.getName());
	    jsonObject.put("type", meta.getTypeDesc());
	    jsonObject.put("text", meta.getCompatibleString( valueMetaAndData.getValueData() ));
	    jsonObject.put("length", meta.getLength());
	    jsonObject.put("precision", meta.getPrecision());
	    
	    jsonObject.put("isnull", meta.isNull( valueMetaAndData.getValueData() ));
	    jsonObject.put("mask", meta.getConversionMask());
	    return jsonObject;
	}
	
	public static ValueMetaAndData decode(JSONObject jsonObject) throws KettleValueException {
		ValueMetaAndData valueMetaAndData = new ValueMetaAndData();

		String valname = jsonObject.optString("name");
		int valtype = ValueMetaBase.getType(jsonObject.optString("type"));
		String text = jsonObject.optString("text");
		boolean isnull = jsonObject.optBoolean("isnull");
		int len = jsonObject.optInt("length", -1);
		int prec = jsonObject.optInt("precision", -1);
		
		String mask = jsonObject.optString("mask");

		ValueMeta valueMeta = new ValueMeta(valname, valtype);
		valueMeta.setLength(len);
		valueMeta.setPrecision(prec);
		if (mask != null) {
			valueMeta.setConversionMask(mask);
		}

		valueMetaAndData.setValueData(text);

		if (valtype != ValueMetaInterface.TYPE_STRING) {
			ValueMetaInterface originMeta = new ValueMeta(valname, ValueMetaInterface.TYPE_STRING);
			if (valueMeta.isNumeric()) {
				originMeta.setDecimalSymbol(".");
				originMeta.setGroupingSymbol(null);
				originMeta.setCurrencySymbol(null);
			}
			valueMetaAndData.setValueData(valueMeta.convertData(originMeta, Const.trim(text)));
		}

		if (isnull) {
			valueMetaAndData.setValueData(null);
		}
		
		valueMetaAndData.setValueMeta(valueMeta);
		
		return valueMetaAndData;
	}

}
