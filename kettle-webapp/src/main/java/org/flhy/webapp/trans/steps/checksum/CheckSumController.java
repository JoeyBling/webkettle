package org.flhy.webapp.trans.steps.checksum;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.pentaho.di.trans.steps.checksum.CheckSumMeta;
import org.springframework.stereotype.Controller;
import org.springframework.util.LinkedCaseInsensitiveMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequestMapping(value="/checksum")
public class CheckSumController {

	@RequestMapping(method=RequestMethod.POST, value="/types")
	protected @ResponseBody List types() throws IOException {
		ArrayList list = new ArrayList();
		
		for (String code : CheckSumMeta.checksumtypeCodes) {
			LinkedCaseInsensitiveMap record = new LinkedCaseInsensitiveMap();
			record.put("code", code);
			list.add(record);
		}
		
		return list;
	}
	
	@RequestMapping(method=RequestMethod.POST, value="/resulttype")
	protected @ResponseBody List resulttype() throws IOException {
		ArrayList list = new ArrayList();
		
		for (int i=0; i<CheckSumMeta.resultTypeCode.length; i++) {
			LinkedCaseInsensitiveMap record = new LinkedCaseInsensitiveMap();
			record.put("code", CheckSumMeta.resultTypeCode[i]);
			record.put("desc", CheckSumMeta.resultTypeDesc[i]);
			list.add(record);
		}
		
		return list;
	}
	
}
