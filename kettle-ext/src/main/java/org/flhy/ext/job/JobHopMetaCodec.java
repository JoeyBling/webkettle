package org.flhy.ext.job;

import java.io.IOException;
import java.io.StringReader;
import java.util.ArrayList;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;

import org.codehaus.jackson.JsonParseException;
import org.codehaus.jackson.map.JsonMappingException;
import org.flhy.ext.core.PropsUI;
import org.flhy.ext.utils.JSONArray;
import org.flhy.ext.utils.SvgImageUrl;
import org.pentaho.di.core.Const;
import org.pentaho.di.core.exception.KettleXMLException;
import org.pentaho.di.core.xml.XMLHandler;
import org.pentaho.di.job.JobHopMeta;
import org.pentaho.di.job.JobMeta;
import org.pentaho.di.laf.BasePropertyHandler;
import org.w3c.dom.DOMException;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.xml.sax.InputSource;
import org.xml.sax.SAXException;

import com.mxgraph.model.mxCell;
import com.mxgraph.util.mxUtils;

public class JobHopMetaCodec {

	public static Element encode(JobHopMeta hop) throws JsonParseException, JsonMappingException, DOMException, IOException {
		Document doc = mxUtils.createDocument();
		Element e = doc.createElement(PropsUI.JOB_HOP);
		
		e.setAttribute("from", hop.getFromEntry().getName());
		e.setAttribute("from_nr", String.valueOf(hop.getFromEntry().getNr()));
		if(hop.getToEntry() != null) {
			e.setAttribute("to", hop.getToEntry().getName());
			e.setAttribute("to_nr", String.valueOf(hop.getToEntry().getNr()));
		}
		e.setAttribute("enabled", hop.isEnabled() ? "Y" : "N");
		e.setAttribute("evaluation", hop.getEvaluation() ? "Y" : "N");
		e.setAttribute("unconditional", hop.isUnconditional() ? "Y" : "N");
		
		
		ArrayList<String> list = new ArrayList<String>();
		if(hop.isUnconditional())
			list.add(SvgImageUrl.getSmallUrl(BasePropertyHandler.getProperty( "UnconditionalHop_image" )));
		else if(hop.getEvaluation())
			list.add(SvgImageUrl.getSmallUrl(BasePropertyHandler.getProperty( "True_image" )));
		else
			list.add(SvgImageUrl.getSmallUrl(BasePropertyHandler.getProperty( "False_image" )));
		
		if(hop.getFromEntry().isLaunchingInParallel())
			list.add(SvgImageUrl.getSmallUrl(BasePropertyHandler.getProperty( "ParallelHop_image" )));
		
		e.setAttribute("label", JSONArray.fromObject(list).toString());
		
		return e;
	}
	
	public static JobHopMeta decode(JobMeta jobMeta, mxCell cell) throws ParserConfigurationException, SAXException, IOException, KettleXMLException {
		StringBuilder retval = new StringBuilder();

	    retval.append( "    " ).append( XMLHandler.openTag( "hop" ) ).append( Const.CR );
	    retval.append( "      " ).append( XMLHandler.addTagValue( "from", cell.getAttribute("from") ) );
	    retval.append( "      " ).append( XMLHandler.addTagValue( "to", cell.getAttribute("to") ) );
	    retval.append( "      " ).append( XMLHandler.addTagValue( "from_nr", cell.getAttribute("from_nr") ) );
	    retval.append( "      " ).append( XMLHandler.addTagValue( "to_nr", cell.getAttribute("to_nr") ) );
	    retval.append( "      " ).append( XMLHandler.addTagValue( "enabled", "Y".equalsIgnoreCase(cell.getAttribute("enabled")) ) );
	    retval.append( "      " ).append( XMLHandler.addTagValue( "evaluation",  "Y".equalsIgnoreCase(cell.getAttribute("evaluation"))) );
	    retval.append( "      " ).append( XMLHandler.addTagValue( "unconditional",  "Y".equalsIgnoreCase(cell.getAttribute("unconditional"))) );
      	retval.append( "    " ).append( XMLHandler.closeTag( "hop" ) ).append( Const.CR );
	      
	    StringReader sr = new StringReader(retval.toString()); 
	    InputSource is = new InputSource(sr); 
	    DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance(); 
	    DocumentBuilder builder=factory.newDocumentBuilder(); 
	    Document doc = builder.parse(is);
		
	    return new JobHopMeta(doc.getDocumentElement(), jobMeta);
	}
	
}
