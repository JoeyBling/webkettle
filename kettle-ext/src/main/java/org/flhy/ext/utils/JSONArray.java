package org.flhy.ext.utils;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.codehaus.jackson.JsonParseException;
import org.codehaus.jackson.map.JsonMappingException;
import org.codehaus.jackson.map.ObjectMapper;
import org.springframework.util.StringUtils;

public class JSONArray extends ArrayList<Object> {

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	
	public JSONArray() {
		
	}
	
	public JSONArray(int initialCapacity) {
		super(initialCapacity);
	}

	public JSONArray(List<Object> list) {
		if(list != null)
			this.addAll(list);
	}

	public static JSONArray fromObject(String json) throws JsonParseException, JsonMappingException, IOException {
		JSONArray jsonArray = new JSONArray();
		if(!StringUtils.hasText(json))
			return jsonArray;
		
		ObjectMapper mapper = new ObjectMapper();
		return mapper.readValue(json, JSONArray.class);
	}
	
	public static JSONArray fromObject(List list) throws JsonParseException, JsonMappingException, IOException {
		return new JSONArray(list);
	}

	public String getString(int i) {
		return (String) get(i);
	}
	
	public JSONObject getJSONObject(int i) {
		Map<String, Object> m = (Map<String, Object>) get(i);
		return new JSONObject(m);
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
//	public static void main(String[] args) throws IOException {
//		String fragment = null;
//		ClassPathResource cpr = new ClassPathResource("common_jndi.json", DatabaseController.class);
//		JSONArray jsonArray = JSONArray.fromObject(fragment);
//	}
}
