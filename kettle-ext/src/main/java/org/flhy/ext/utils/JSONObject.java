package org.flhy.ext.utils;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.codehaus.jackson.JsonParseException;
import org.codehaus.jackson.map.JsonMappingException;
import org.codehaus.jackson.map.ObjectMapper;
import org.springframework.util.StringUtils;

public class JSONObject extends LinkedHashMap<String, Object> {

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	
	public JSONObject() {
	}
	
	public JSONObject(Map<String, Object> m) {
		if(m != null)
			this.putAll(m);
	}
	
	public static JSONObject fromObject(String json) throws JsonParseException, JsonMappingException, IOException {
		JSONObject jsonObject = new JSONObject();
		if(!StringUtils.hasText(json))
			return jsonObject;
		
		ObjectMapper mapper = new ObjectMapper();
		return mapper.readValue(json, JSONObject.class);
	}

	
	public String optString(String key) {
		Object v = get(key);
		if(v == null) return null;
		
		if(v instanceof String) {
			String value = (String) v;
			if("null".equals(value))
				return null;
			return value;
		} else {
			return String.valueOf(v);
		}
	}
	
	public Integer optInt(String key) {
		return optInt(key, null);
	}
	
	public Integer optInt(String key, Integer defVal) {
		Object value = get(key);
		if(value == null) return defVal;
		
		if(value instanceof Number) {
			Number num = (Number) value;
			return num.intValue();
		} else if(value instanceof String) {
			String string = optString(key);
			if(StringUtils.isEmpty(string)) 
				return defVal;
			Double d = Double.parseDouble(string);
			return d.intValue();
		}
		return (Integer) value;
	}
	
	public Boolean optBoolean(String key) {
		Object value = get(key);
		if(value == null)
			return false;
		return (Boolean) value;
	}
	
	@Override
	public Object put(String key, Object value) {
		if(value == null) return value;
		return super.put(key, value);
	}

	public JSONObject optJSONObject(String key) {
		Object value = get(key);
		if(value instanceof String) {
			String v = (String) value;
			if(!StringUtils.hasText(v))
				return null;
		}
		
		Map<String, Object> m = (Map<String, Object>) value;
		if(m == null) return null;
		return new JSONObject(m);
	}
	
	public JSONArray optJSONArray(String key) {
		if(containsKey(key)) {
			List list = (List) get(key);
			JSONArray jsonArray = new JSONArray(list.size());
			jsonArray.addAll(list);
			return jsonArray;
		}
		return null;
	}
	
	public String toString() {
		ObjectMapper mapper = new ObjectMapper();
		try {
			return mapper.writeValueAsString(this);
		} catch (Exception e) {
			e.printStackTrace();
			return null;
		}
	}
}
