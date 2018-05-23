package org.flhy.webapp.core;

import java.awt.Color;
import java.awt.Font;
import java.awt.FontMetrics;
import java.awt.Graphics;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import javax.imageio.ImageIO;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.swing.JLabel;

import org.apache.commons.io.IOUtils;
import org.flhy.ext.PluginFactory;
import org.flhy.ext.core.PropsUI;
import org.flhy.ext.utils.JsonUtils;
import org.flhy.ext.utils.SvgImageUrl;
import org.flhy.webapp.utils.StepImageManager;
import org.pentaho.di.core.plugins.JobEntryPluginType;
import org.pentaho.di.core.plugins.PluginInterface;
import org.pentaho.di.core.plugins.PluginRegistry;
import org.pentaho.di.core.plugins.StepPluginType;
import org.pentaho.di.core.util.EnvUtil;
import org.pentaho.di.i18n.BaseMessages;
import org.pentaho.di.i18n.LanguageChoice;
import org.pentaho.di.job.entry.JobEntryInterface;
import org.pentaho.di.laf.BasePropertyHandler;
import org.pentaho.di.trans.step.StepMetaInterface;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Controller;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequestMapping(value="/ui")
public class KettleUIController {
	
	@ResponseBody
	@RequestMapping(method=RequestMethod.GET, value="/text2image")
	protected void text2image(HttpServletRequest request, HttpServletResponse response) throws IOException {
		String text = request.getParameter("text");
		
		Font f = new Font("Arial", Font.PLAIN, 12);
		JLabel j = new JLabel();
		FontMetrics fm = j.getFontMetrics(f);
		 
		int width = fm.stringWidth(text), height = 12;
		BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB); 
		Graphics g = image.getGraphics(); 
		g.fillRect(0, 0, width, height); 
		g.setFont(new Font("Arial",Font.PLAIN, 12)); 
		g.setColor(Color.BLACK);
		g.drawString(text, 0, height - (height - 8) / 2); 
		g.dispose();
		response.setContentType("image/png");
		ImageIO.write(image, "PNG", response.getOutputStream()); 
	}

	@ResponseBody
	@RequestMapping(method=RequestMethod.GET, value="/text2image/width")
	protected void text2image_width(HttpServletRequest request, HttpServletResponse response) throws IOException {
		String text = request.getParameter("text");
		
		Font f = new Font("Arial", Font.PLAIN, 12);
		JLabel j = new JLabel();
		FontMetrics fm = j.getFontMetrics(f);
		
		response.getWriter().write(String.valueOf(fm.stringWidth(text)));
	}
	
	@ResponseBody
	@RequestMapping(method=RequestMethod.GET, value="/text2image/partition")
	protected void text2image_partition(HttpServletRequest request, HttpServletResponse response) throws IOException {
		String text = request.getParameter("text");
		
		Font f = new Font("Arial", Font.PLAIN, 12);
		JLabel j = new JLabel();
		FontMetrics fm = j.getFontMetrics(f);
		 
		int dx = 4, dy = 4, width = fm.stringWidth(text) + dx * 2, height = 12 + dy * 2, lineHeight = 8 + dy;
		
		
		BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB); 
		Graphics g = image.getGraphics(); 
		g.fillRect(0, 0, width, height); 
		g.setColor(Color.RED);
		g.drawRect(1, 1, width - 2, height - 2);
		
		g.setFont(new Font("Arial",Font.PLAIN, 12)); 
		g.drawString(text, dx + 1, (height + lineHeight) / 2); 
		
		g.dispose();
		response.setContentType("image/png");
		ImageIO.write(image, "PNG", response.getOutputStream()); 
	}

	@ResponseBody
	@RequestMapping(method={RequestMethod.POST, RequestMethod.GET}, value="/images/{name}")
	protected void images(HttpServletRequest request, HttpServletResponse response, @PathVariable String name) throws Exception {
		int scale = 16;
		String scale_str = request.getParameter("scale");
		if(StringUtils.hasText(scale_str) && scale_str.matches("\\d+"))
			scale = Integer.parseInt(scale_str);
		
		ClassLoader cl = Thread.currentThread().getContextClassLoader();
		BufferedImage image = StepImageManager.getUniversalImage(cl, "ui/images/" + name + ".svg", scale);
		response.setContentType("image/png");
		ImageIO.write(image, "PNG", response.getOutputStream());
		response.getOutputStream().flush();
	}
	
	@ResponseBody
	@RequestMapping(method={RequestMethod.POST, RequestMethod.GET}, value="/css/{name}")
	protected void css(HttpServletRequest request, HttpServletResponse response, @PathVariable String name) throws Exception {
		StringBuffer sb = new StringBuffer();
		for(Map.Entry<String, String> entry : images.entrySet()) {
			String url = request.getContextPath()+ "/" + entry.getValue();
			sb.append("." + entry.getKey() + " { background-image: url(" + url + ") !important;}\n\n");
		}
		
		response.setContentType("text/css");
		response.getWriter().write(sb.toString());
	}
	
	@ResponseBody
	@RequestMapping(method={RequestMethod.POST, RequestMethod.GET}, value="/locale")
	protected void locale(@RequestParam String locale) throws Exception {
	    LanguageChoice.getInstance().setDefaultLocale( EnvUtil.createLocale( locale ) );
	    LanguageChoice.getInstance().saveSettings();
	    
	    JsonUtils.success("aaa");
	}
	
	@ResponseBody
	@RequestMapping(method={RequestMethod.POST, RequestMethod.GET}, value="/stepjs/{pluginId}")
	protected void stepjs(HttpServletRequest request, HttpServletResponse response, @PathVariable String pluginId) throws Exception {
		if(PluginFactory.containBean(pluginId)) {
			Object plugin = PluginFactory.getBean(pluginId);
			ClassPathResource cpr = new ClassPathResource(pluginId + ".js", plugin.getClass());
			Class clazz = null;
			PluginInterface sp = PluginRegistry.getInstance().getPlugin(StepPluginType.class, pluginId);
			if(sp != null) {
				StepMetaInterface stepMetaInterface = PluginRegistry.getInstance().loadClass(sp, StepMetaInterface.class);
				clazz = stepMetaInterface.getClass();
			} else {
				sp = PluginRegistry.getInstance().getPlugin(JobEntryPluginType.class, pluginId);
				JobEntryInterface jobEntryInterface = PluginRegistry.getInstance().loadClass(sp, JobEntryInterface.class);
				clazz = jobEntryInterface.getClass();
			}
			
			response.setContentType("text/javascript;charset=utf-8");
			String js = IOUtils.toString(cpr.getInputStream(), "utf-8");
			
			if(clazz != null) {
				StringBuilder sb = new StringBuilder();
				int index = js.indexOf("BaseMessages.getString(");
				while(index != -1) {
					String key = js.substring(js.indexOf(",", index) + 1).trim();
					String quota = key.substring(0, 1);
					key = key.substring(1);
					int end = key.indexOf(quota);
					key = key.substring(0, end);
					String value = BaseMessages.getString(clazz, key);
					sb.append("BaseMessages.add('").append(key).append("', '").append(value).append("');\n");
					
					index = js.indexOf("BaseMessages.getString(", index + 10);
				}
				
				js = sb.toString() + js;
			}
			
			
			response.getWriter().write(js);

		}
		
	}
	
	@ResponseBody
	@RequestMapping(method={RequestMethod.POST, RequestMethod.GET}, value="/global")
	protected void global(HttpServletRequest request, HttpServletResponse response) throws Exception {
		StringBuffer sb = new StringBuffer("var kettle = {\n");
		for(Map.Entry<String, String> entry : jsimages.entrySet()) {
			sb.append("\t").append(entry.getKey()).append(": '").append(entry.getValue()).append("', \n");
		}
		sb.append("\t").append("step_size").append(": ").append(PropsUI.STEP_SIZE).append("\n");
		
		sb.append("};");
		response.setContentType("text/javascript;charset=utf-8");
		response.getWriter().write(sb.toString());
	}
	
	static HashMap<String, String> images = new HashMap<String, String>();
	static HashMap<String, String> jsimages = new HashMap<String, String>();
	
	static {
		// 执行结果面板上的图标
		images.put("imageShowHistory", SvgImageUrl.getSmallUrl(BasePropertyHandler.getProperty( "ShowHistory_image" )));
		images.put("imageShowLog", SvgImageUrl.getSmallUrl(BasePropertyHandler.getProperty( "ShowLog_image" )));
		images.put("imageShowGrid", SvgImageUrl.getSmallUrl(BasePropertyHandler.getProperty( "ShowGrid_image" )));
		images.put("imageShowPerf", SvgImageUrl.getSmallUrl(BasePropertyHandler.getProperty( "ShowPerf_image" )));
		images.put("imageGantt", SvgImageUrl.getSmallUrl(BasePropertyHandler.getProperty( "Gantt_image" )));
		images.put("imagePreview", SvgImageUrl.getSmallUrl(BasePropertyHandler.getProperty( "Preview_image" )));
		
		// 转换和作业的小图标
		images.put("imageFolder", SvgImageUrl.getMiddleUrl(BasePropertyHandler.getProperty( "Folder_image" )));
		images.put("trans", SvgImageUrl.getSmallUrl(BasePropertyHandler.getProperty( "SpoonIcon_image" )));
		images.put("job", SvgImageUrl.getSmallUrl(BasePropertyHandler.getProperty( "ChefIcon_image" )));
		
		// 转换和作业的小图标
		images.put("schema", SvgImageUrl.getSmallUrl(BasePropertyHandler.getProperty( "Schema_image" )));
		images.put("datatable", SvgImageUrl.getSmallUrl(BasePropertyHandler.getProperty( "Table_image" )));
		images.put("dataview", SvgImageUrl.getSmallUrl(BasePropertyHandler.getProperty( "View_image" )));
		images.put("synonym", SvgImageUrl.getSmallUrl(BasePropertyHandler.getProperty( "Synonym_image" )));
		
		// 工具栏上的图标
		images.put("save", SvgImageUrl.getSmallUrl("ui/images/save.svg"));
		images.put("run", SvgImageUrl.getSmallUrl("ui/images/run.svg"));
		images.put("schedule", SvgImageUrl.getMiddleUrl(BasePropertyHandler.getProperty( "STR_image" )));
		images.put("pause", SvgImageUrl.getSmallUrl("ui/images/pause.svg"));
		images.put("stop", SvgImageUrl.getSmallUrl("ui/images/stop.svg"));
		images.put("preview", SvgImageUrl.getSmallUrl("ui/images/preview.svg"));
		images.put("debug", SvgImageUrl.getSmallUrl("ui/images/debug.svg"));
		
		images.put("replay", SvgImageUrl.getSmallUrl("ui/images/replay.svg"));
		images.put("check", SvgImageUrl.getSmallUrl("ui/images/check.svg"));
		images.put("impact", SvgImageUrl.getSmallUrl("ui/images/impact.svg"));
		images.put("SQLbutton", SvgImageUrl.getSmallUrl("ui/images/SQLbutton.svg"));
		images.put("exploredb", SvgImageUrl.getSmallUrl("ui/images/exploredb.svg"));
		
		images.put("SlaveServer", SvgImageUrl.getSmallUrl(BasePropertyHandler.getProperty( "Slave_image" )));
		images.put("PartitionSchema", SvgImageUrl.getSmallUrl(BasePropertyHandler.getProperty( "Schema_image" )));
		images.put("ClusterSchema", SvgImageUrl.getSmallUrl(BasePropertyHandler.getProperty( "Cluster_image" )));
		
		images.put("show-results", SvgImageUrl.getSmallUrl("ui/images/show-results.svg"));
		
		// javscript组件图标
		images.put("underGreen", SvgImageUrl.getSmallUrl( "ui/images/underGreen.svg"));
		images.put("arrowGreen", SvgImageUrl.getSmallUrl( "ui/images/arrowGreen.svg"));
		images.put("arrowOrange", SvgImageUrl.getSmallUrl( "ui/images/arrowOrange.svg"));
		
		images.put("addNew", SvgImageUrl.getSmallUrl( "ui/images/addSmall.svg"));
		images.put("addCopy", SvgImageUrl.getSmallUrl( "ui/images/copySmall.svg"));
		images.put("activeScript", SvgImageUrl.getSmallUrl( "ui/images/faScript.svg"));
		images.put("activeStartScript", SvgImageUrl.getSmallUrl( "ui/images/SQLbutton.svg"));
		images.put("activeEndScript", SvgImageUrl.getSmallUrl( "ui/images/edfScript.svg"));
		images.put("scriptType", SvgImageUrl.getSmallUrl( "ui/images/hide-inactive.svg"));
		
		images.put("condition_add", SvgImageUrl.getSmallUrl( "ui/images/eq_add.svg" ));
		
		//线上小图标
		jsimages.put("imageUnconditionalHop", SvgImageUrl.getSmallUrl(BasePropertyHandler.getProperty( "UnconditionalHop_image" )));
		jsimages.put("imageParallelHop", SvgImageUrl.getSmallUrl(BasePropertyHandler.getProperty( "ParallelHop_image" )));
		jsimages.put("imageTrue", SvgImageUrl.getSmallUrl(BasePropertyHandler.getProperty( "True_image" )));
		jsimages.put("imageFalse", SvgImageUrl.getSmallUrl(BasePropertyHandler.getProperty( "False_image" )));
		jsimages.put("imageCopyHop", SvgImageUrl.getSmallUrl(BasePropertyHandler.getProperty( "CopyHop_image" )));
		
	}
}
