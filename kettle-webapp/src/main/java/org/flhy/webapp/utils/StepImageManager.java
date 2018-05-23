package org.flhy.webapp.utils;

import java.awt.AlphaComposite;
import java.awt.BasicStroke;
import java.awt.Color;
import java.awt.Graphics;
import java.awt.Graphics2D;
import java.awt.Image;
import java.awt.RenderingHints;
import java.awt.Transparency;
import java.awt.geom.AffineTransform;
import java.awt.geom.Dimension2D;
import java.awt.image.BufferedImage;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;

import javax.imageio.ImageIO;

import org.apache.batik.bridge.BridgeContext;
import org.apache.batik.bridge.DocumentLoader;
import org.apache.batik.bridge.GVTBuilder;
import org.apache.batik.bridge.UserAgentAdapter;
import org.apache.batik.dom.svg.SAXSVGDocumentFactory;
import org.apache.batik.gvt.GraphicsNode;
import org.apache.batik.util.XMLResourceDescriptor;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.vfs2.FileObject;
import org.apache.commons.vfs2.FileSystemException;
import org.flhy.ext.utils.SvgImageUrl;
import org.pentaho.di.core.exception.KettleFileException;
import org.pentaho.di.core.logging.LogChannel;
import org.pentaho.di.core.logging.LogChannelInterface;
import org.pentaho.di.core.svg.SvgSupport;
import org.pentaho.di.core.vfs.KettleVFS;
import org.pentaho.di.ui.util.SwtSvgImageUtil;
import org.w3c.dom.Document;

public class StepImageManager {

	private static LogChannelInterface log = new LogChannel("SvgImageUtil");
	private static final String NO_IMAGE = "ui/images/no_image.svg";
	
	private static FileObject base;

	static {
		try {
			base = KettleVFS.getInstance().getFileSystemManager().resolveFile(System.getProperty("user.dir"));
		} catch (FileSystemException e) {
			e.printStackTrace();
			base = null;
		}
	}
	
	public static BufferedImage getUniversalImage(ClassLoader classLoader, String filename, int scale) throws IOException {

		if (StringUtils.isBlank(filename)) {
			log.logError("Unable to load image [" + filename + "]");
			return getImageAsResource(NO_IMAGE, scale);
		}

		BufferedImage result = null;
		if (SvgSupport.isSvgEnabled()) {
			result = getUniversalImageInternal(classLoader, SvgSupport.toSvgName(filename), scale);
		}

		if (result == null) {
			result = getUniversalImageInternal(classLoader, SvgSupport.toPngName(filename), scale);
		}

		if (result == null) {
			log.logError("Unable to load image [" + filename + "]");
			result = getImageAsResource(NO_IMAGE, scale);
		}
		return result;
	}

	public static BufferedImage getImageAsResource(String location, int scale) throws IOException {
		BufferedImage result = null;
		if (result == null && SvgSupport.isSvgEnabled()) {
			result = getImageAsResourceInternal(SvgSupport.toSvgName(location), scale);
		}
		if (result == null) {
			result = getImageAsResourceInternal(SvgSupport.toPngName(location), scale);
		}
		if (result == null && !location.equals(NO_IMAGE)) {
			log.logError("Unable to load image [" + location + "]");
			result = getImageAsResource(NO_IMAGE, scale);
		}
		if (result == null) {
			log.logError("Unable to load image [" + location + "]");
//			result = getMissingImage();
		}
		return result;
	}
	
	private static BufferedImage getUniversalImageInternal(ClassLoader classLoader, String filename, int scale) throws IOException {
		BufferedImage result = loadFromClassLoader(classLoader, filename, scale);
		if (result == null) {
			result = loadFromClassLoader(classLoader, "/" + filename, scale);
			if (result == null) {
				result = loadFromClassLoader(classLoader, "ui/images/" + filename, scale);
				if (result == null) {
					result = getImageAsResourceInternal(filename, scale);
				}
			}
		}
		return result;
	}
	
	/**
	 * Internal image loading by ClassLoader.getResourceAsStream.
	 */
	private static BufferedImage loadFromClassLoader(ClassLoader classLoader, String location, int scale) throws IOException {
		InputStream s = null;
		try {
			s = classLoader.getResourceAsStream(location);
		} catch (Throwable t) {
			log.logDebug("Unable to load image from classloader [" + location + "]");
		}
		if (s == null) {
			return null;
		}
		try {
			return loadImage(s, location, scale);
		} finally {
			IOUtils.closeQuietly(s);
		}
	}
	
	/**
	 * Load image from several sources.
	 */
	private static BufferedImage getImageAsResourceInternal(String location, int scale) throws IOException {
		BufferedImage result = null;
		if (result == null) {
			result = loadFromCurrentClasspath(location, scale);
		}
		if (result == null) {
			result = loadFromBasedVFS(location, scale);
		}
		if (result == null) {
			result = loadFromSimpleVFS(location, scale);
		}
		return result;
	}
	
	/**
	 * Internal image loading by
	 * Thread.currentThread.getContextClassLoader.getResource.
	 */
	private static BufferedImage loadFromCurrentClasspath(String location, int scale) throws IOException {
		ClassLoader cl = Thread.currentThread().getContextClassLoader();
		if (cl == null) {
			// Can't count on Thread.currentThread().getContextClassLoader()
			// being non-null on Mac
			// Have to provide some fallback
			cl = SwtSvgImageUtil.class.getClassLoader();
		}
		URL res = null;
		try {
			res = cl.getResource(location);
		} catch (Throwable t) {
			log.logDebug("Unable to load image from classloader [" + location + "]");
		}
		if (res == null) {
			return null;
		}
		InputStream s;
		try {
			s = res.openStream();
		} catch (IOException ex) {
			return null;
		}
		if (s == null) {
			return null;
		}
		try {
			return loadImage(s, location, scale);
		} finally {
			IOUtils.closeQuietly(s);
		}
	}
	
	/**
	 * Internal image loading from Kettle's user.dir VFS.
	 */
	private static BufferedImage loadFromBasedVFS(String location, int scale) throws IOException {
		try {
			FileObject imageFileObject = KettleVFS.getInstance().getFileSystemManager().resolveFile(base, location);
			InputStream s = KettleVFS.getInputStream(imageFileObject);
			if (s == null) {
				return null;
			}
			try {
				return loadImage(s, location, scale);
			} finally {
				IOUtils.closeQuietly(s);
			}
		} catch (FileSystemException ex) {
			return null;
		}
	}

	private static BufferedImage loadFromSimpleVFS(String location, int scale) throws IOException {
		try {
			InputStream s = KettleVFS.getInputStream(location);
			if (s == null) {
				return null;
			}
			try {
				return loadImage(s, location, scale);
			} finally {
				IOUtils.closeQuietly(s);
			}
		} catch (KettleFileException e) {
			// do nothing. try to load next
		}
		return null;
	}
	
	public static void main(String[] args) throws IOException {
		ClassLoader cl = Thread.currentThread().getContextClassLoader();
		InputStream is = cl.getResource("ui/images/eq_add.png").openStream();
		
		BufferedImage bi = loadImage(is, "ui/images/eq_add.png", 16);
		ImageIO.write(bi, "PNG", new FileOutputStream("1.png")); 
	}
	
	private static BufferedImage loadImage(InputStream in, String filename, int scale) throws IOException {
		if (SvgSupport.isSvgName(filename)) {
			SAXSVGDocumentFactory factory = new SAXSVGDocumentFactory( XMLResourceDescriptor.getXMLParserClassName() );
			Document doc = factory.createDocument( null, in );
			UserAgentAdapter userAgentAdapter = new UserAgentAdapter();
		    DocumentLoader documentLoader = new DocumentLoader( userAgentAdapter );
		    BridgeContext ctx = new BridgeContext( userAgentAdapter, documentLoader );
		    GVTBuilder builder = new GVTBuilder();
		    GraphicsNode svgGraphicsNode = builder.build( ctx, doc );
		    Dimension2D svgGraphicsSize = ctx.getDocumentSize();
		    
		    BufferedImage image = SvgImageUrl.createImage(scale);//new BufferedImage( width, height, BufferedImage.TYPE_INT_ARGB );
		    renderSvg( image, svgGraphicsNode, svgGraphicsSize, 0 );
		    
		    return image;
		} else {
			BufferedImage png = ImageIO.read(in);
			
//          新生成结果图片
            BufferedImage result = new BufferedImage(scale, scale,  BufferedImage.TYPE_INT_RGB);  
            result.getGraphics().drawImage( png.getScaledInstance(scale, scale, java.awt.Image.SCALE_SMOOTH), 0, 0, null);  
			
			return result;
		}
	}
	
	public static void renderSvg(BufferedImage image, GraphicsNode svgGraphicsNode, Dimension2D svgGraphicsSize, double angleRadians) {
		
		int width = image.getWidth();
		int height = image.getHeight();
		int centerX = width / 2;
		int centerY = height / 2;
		
		Graphics2D gc = (Graphics2D) image.getGraphics();
	    gc.setRenderingHint( RenderingHints.KEY_STROKE_CONTROL, RenderingHints.VALUE_STROKE_PURE );
	    gc.setRenderingHint( RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON );
	    gc.setRenderingHint( RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY );
	    gc.setRenderingHint( RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC );
	    gc.setRenderingHint( RenderingHints.KEY_DITHERING, RenderingHints.VALUE_DITHER_DISABLE );
		
		double scaleX = width / svgGraphicsSize.getWidth();
		double scaleY = height / svgGraphicsSize.getHeight();

		AffineTransform affineTransform = new AffineTransform();
		if (centerX != 0 || centerY != 0) {
			affineTransform.translate(centerX, centerY);
		}
		affineTransform.scale(scaleX, scaleY);
		if (angleRadians != 0) {
			affineTransform.rotate(angleRadians);
		}
		affineTransform.translate(-svgGraphicsSize.getWidth() / 2, -svgGraphicsSize.getHeight() / 2);
		svgGraphicsNode.setTransform(affineTransform);
		svgGraphicsNode.paint(gc);
		gc.dispose();
	}
}
