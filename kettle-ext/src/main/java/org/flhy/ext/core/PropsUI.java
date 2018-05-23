package org.flhy.ext.core;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Hashtable;
import java.util.List;
import java.util.Properties;

import org.pentaho.di.core.Const;
import org.pentaho.di.core.LastUsedFile;
import org.pentaho.di.core.ObjectUsageCount;
import org.pentaho.di.core.Props;
import org.pentaho.di.core.gui.GUIOption;
import org.pentaho.di.core.gui.GUIPositionInterface;
import org.pentaho.di.core.gui.Point;
import org.pentaho.di.core.logging.LogChannel;
import org.pentaho.di.core.plugins.LifecyclePluginType;
import org.pentaho.di.core.plugins.PluginInterface;
import org.pentaho.di.core.plugins.PluginRegistry;
import org.pentaho.di.ui.core.ConstUI;
import org.pentaho.di.ui.core.gui.WindowProperty;

public class PropsUI extends Props {
	
	private static final String NO = "N";

	private static final String YES = "Y";

	// private static Display display;

	protected List<LastUsedFile> lastUsedFiles;
	protected List<LastUsedFile> openTabFiles;

	protected String overriddenFileName;

	private Hashtable<String, WindowProperty> screens;

	private static final String STRING_SHOW_COPY_OR_DISTRIBUTE_WARNING = "ShowCopyOrDistributeWarning";

	private static final String STRING_SHOW_WELCOME_PAGE_ON_STARTUP = "ShowWelcomePageOnStartup";

	private static final String STRING_SHOW_BRANDING_GRAPHICS = "ShowBrandingGraphics";

	private static final String STRING_ONLY_SHOW_ACTIVE_FILE = "OnlyShowActiveFileInTree";

	private static final String SHOW_TOOL_TIPS = "ShowToolTips";

	private static final String SHOW_HELP_TOOL_TIPS = "ShowHelpToolTips";

	private static final String CANVAS_GRID_SIZE = "CanvasGridSize";

	private static final String LEGACY_PERSPECTIVE_MODE = "LegacyPerspectiveMode";

	private static List<GUIOption<Object>> editables;
	
	private static String appName;
	
	public static final String TRANS_STEP_NAME = "Step";
	public static final String TRANS_HOP = "TransHop";
	public static final String JOB_JOBENTRY_NAME = "JobEntry";
	public static final String JOB_HOP = "JobHop";
	public static final String NOTEPAD = "NotePad";
	
	public static final int STEP_SIZE = 37;
	
	public static void init(String name, int t) {
		appName = name;
		if (props == null) {
			props = new PropsUI(t);
		}
	}
	
	public static String getAppName() {
		return appName;
	}

	/**
	 * Check to see whether the Kettle properties where loaded.
	 * 
	 * @return true if the Kettle properties where loaded.
	 */
	public static boolean isInitialized() {
		return props != null;
	}

	public static PropsUI getInstance() {
		if (props != null) {
			return (PropsUI) props;
		}

		throw new RuntimeException(
				"Properties, Kettle systems settings, not initialised!");
	}

	private PropsUI(int t) {
		super(t);
	}

	private PropsUI(String filename) {
		super(filename);
	}

	@SuppressWarnings("unchecked")
	protected synchronized void init() {
		super.createLogChannel();
		properties = new Properties();
		pluginHistory = new ArrayList<ObjectUsageCount>();

		setDefault();
		loadProps();
		addDefaultEntries();

		loadPluginHistory();

		loadScreens();
		loadLastUsedFiles();
		loadOpenTabFiles();

		PluginRegistry registry = PluginRegistry.getInstance();
		List<PluginInterface> plugins = registry.getPlugins(LifecyclePluginType.class);
		List<GUIOption<Object>> leditables = new ArrayList<GUIOption<Object>>();
		for (PluginInterface plugin : plugins) {
			if (!plugin.getClassMap().keySet().contains(GUIOption.class)) {
				continue;
			}

			try {
				GUIOption<Object> loaded = registry.loadClass(plugin, GUIOption.class);
				if (loaded != null) {
					leditables.add(loaded);
				}
			} catch (ClassCastException cce) {
				// Not all Lifecycle plugins implement GUIOption, keep calm and
				// carry on
				LogChannel.GENERAL.logBasic("Plugin " + plugin.getIds()[0] + " does not implement GUIOption, it will not be editable");
			} catch (Exception e) {
				LogChannel.GENERAL.logError( "Unexpected error loading class for plugin " + plugin.getName(), e);
			}
		}

		editables = Collections.unmodifiableList(leditables);

	}

	public void setDefault() {

		lastUsedFiles = new ArrayList<LastUsedFile>();
		openTabFiles = new ArrayList<LastUsedFile>();
		screens = new Hashtable<String, WindowProperty>();

		properties.setProperty(STRING_LOG_LEVEL, getLogLevel());
		properties.setProperty(STRING_LOG_FILTER, getLogFilter());

	}

	public void loadScreens() {
		screens = new Hashtable<String, WindowProperty>();

		int nr = 1;

		String name = properties.getProperty("ScreenName" + nr);
		while (name != null) {
			boolean max = YES.equalsIgnoreCase(properties.getProperty(STRING_SIZE_MAX + nr));
			int x = Const.toInt(properties.getProperty(STRING_SIZE_X + nr), 0);
			int y = Const.toInt(properties.getProperty(STRING_SIZE_Y + nr), 0);
			int w = Const.toInt(properties.getProperty(STRING_SIZE_W + nr), 320);
			int h = Const.toInt(properties.getProperty(STRING_SIZE_H + nr), 200);

			WindowProperty winprop = new WindowProperty(name, max, x, y, w, h);
			screens.put(name, winprop);

			nr++;
			name = properties.getProperty("ScreenName" + nr);
		}
	}

	public void saveProps() {
		setLastFiles();
		setOpenTabFiles();

		super.saveProps();
	}

	public void setLastFiles() {
		properties.setProperty("lastfiles", "" + lastUsedFiles.size());
		for (int i = 0; i < lastUsedFiles.size(); i++) {
			LastUsedFile lastUsedFile = lastUsedFiles.get(i);

			properties.setProperty("filetype" + (i + 1), Const.NVL( lastUsedFile.getFileType(), LastUsedFile.FILE_TYPE_TRANSFORMATION));
			properties.setProperty("lastfile" + (i + 1), Const.NVL(lastUsedFile.getFilename(), ""));
			properties.setProperty("lastdir" + (i + 1), Const.NVL(lastUsedFile.getDirectory(), ""));
			properties.setProperty("lasttype" + (i + 1), lastUsedFile.isSourceRepository() ? YES : NO);
			properties.setProperty("lastrepo" + (i + 1), Const.NVL(lastUsedFile.getRepositoryName(), ""));
		}
	}

	public void setOpenTabFiles() {
		properties.setProperty("tabfiles", "" + openTabFiles.size());
		for (int i = 0; i < openTabFiles.size(); i++) {
			LastUsedFile openTabFile = openTabFiles.get(i);

			properties.setProperty("tabtype" + (i + 1), Const.NVL( openTabFile.getFileType(), LastUsedFile.FILE_TYPE_TRANSFORMATION));
			properties.setProperty("tabfile" + (i + 1), Const.NVL(openTabFile.getFilename(), ""));
			properties.setProperty("tabdir" + (i + 1), Const.NVL(openTabFile.getDirectory(), ""));
			properties.setProperty("tabrep" + (i + 1), openTabFile.isSourceRepository() ? YES : NO);
			properties.setProperty("tabrepname" + (i + 1), Const.NVL(openTabFile.getRepositoryName(), ""));
			properties.setProperty("tabopened" + (i + 1), openTabFile.isOpened() ? YES : NO);
			properties.setProperty("tabopentypes" + (i + 1), "" + openTabFile.getOpenItemTypes());
		}
	}

	/**
	 * Add a last opened file to the top of the recently used list.
	 * 
	 * @param fileType
	 *            the type of file to use @see LastUsedFile
	 * @param filename
	 *            The name of the file or transformation
	 * @param directory
	 *            The repository directory path, null in case lf is an XML file
	 * @param sourceRepository
	 *            True if the file was loaded from repository, false if ld is an
	 *            XML file.
	 * @param repositoryName
	 *            The name of the repository the file was loaded from or save
	 *            to.
	 */
	public void addLastFile(String fileType, String filename, String directory,
			boolean sourceRepository, String repositoryName) {
		LastUsedFile lastUsedFile = new LastUsedFile(fileType, filename,
				directory, sourceRepository, repositoryName, false,
				LastUsedFile.OPENED_ITEM_TYPE_MASK_GRAPH);

		int idx = lastUsedFiles.indexOf(lastUsedFile);
		if (idx >= 0) {
			lastUsedFiles.remove(idx);
		}
		// Add it to position 0
		lastUsedFiles.add(0, lastUsedFile);

		// If we have more than Const.MAX_FILE_HIST, top it off
		while (lastUsedFiles.size() > Const.MAX_FILE_HIST) {
			lastUsedFiles.remove(lastUsedFiles.size() - 1);
		}
	}

	/**
	 * Add a last opened file to the top of the recently used list.
	 * 
	 * @param fileType
	 *            the type of file to use @see LastUsedFile
	 * @param filename
	 *            The name of the file or transformation
	 * @param directory
	 *            The repository directory path, null in case lf is an XML file
	 * @param sourceRepository
	 *            True if the file was loaded from repository, false if ld is an
	 *            XML file.
	 * @param repositoryName
	 *            The name of the repository the file was loaded from or save
	 *            to.
	 */
	public void addOpenTabFile(String fileType, String filename,
			String directory, boolean sourceRepository, String repositoryName,
			int openTypes) {
		LastUsedFile lastUsedFile = new LastUsedFile(fileType, filename,
				directory, sourceRepository, repositoryName, true, openTypes);
		openTabFiles.add(lastUsedFile);
	}

	public void loadLastUsedFiles() {
		lastUsedFiles = new ArrayList<LastUsedFile>();
		int nr = Const.toInt(properties.getProperty("lastfiles"), 0);
		for (int i = 0; i < nr; i++) {
			String fileType = properties.getProperty("filetype" + (i + 1),
					LastUsedFile.FILE_TYPE_TRANSFORMATION);
			String filename = properties.getProperty("lastfile" + (i + 1), "");
			String directory = properties.getProperty("lastdir" + (i + 1), "");
			boolean sourceRepository = YES.equalsIgnoreCase(properties
					.getProperty("lasttype" + (i + 1), NO));
			String repositoryName = properties
					.getProperty("lastrepo" + (i + 1));
			boolean isOpened = YES.equalsIgnoreCase(properties.getProperty(
					"lastopened" + (i + 1), NO));
			int openItemTypes = Const.toInt(
					properties.getProperty("lastopentypes" + (i + 1), "0"), 0);

			lastUsedFiles.add(new LastUsedFile(fileType, filename, directory,
					sourceRepository, repositoryName, isOpened, openItemTypes));
		}
	}

	public void loadOpenTabFiles() {
		openTabFiles = new ArrayList<LastUsedFile>();
		int nr = Const.toInt(properties.getProperty("tabfiles"), 0);
		for (int i = 0; i < nr; i++) {
			String fileType = properties.getProperty("tabtype" + (i + 1),
					LastUsedFile.FILE_TYPE_TRANSFORMATION);
			String filename = properties.getProperty("tabfile" + (i + 1), "");
			String directory = properties.getProperty("tabdir" + (i + 1), "");
			boolean sourceRepository = YES.equalsIgnoreCase(properties
					.getProperty("tabrep" + (i + 1), NO));
			String repositoryName = properties.getProperty("tabrepname"
					+ (i + 1));
			boolean isOpened = YES.equalsIgnoreCase(properties.getProperty(
					"tabopened" + (i + 1), NO));
			int openItemTypes = Const.toInt(
					properties.getProperty("tabopentypes" + (i + 1), "0"), 0);

			openTabFiles.add(new LastUsedFile(fileType, filename, directory,
					sourceRepository, repositoryName, isOpened, openItemTypes));
		}
	}

	public List<LastUsedFile> getLastUsedFiles() {
		return lastUsedFiles;
	}

	public void setLastUsedFiles(List<LastUsedFile> lastUsedFiles) {
		this.lastUsedFiles = lastUsedFiles;
	}

	public String[] getLastFileTypes() {
		String[] retval = new String[lastUsedFiles.size()];
		for (int i = 0; i < retval.length; i++) {
			LastUsedFile lastUsedFile = lastUsedFiles.get(i);
			retval[i] = lastUsedFile.getFileType();
		}
		return retval;
	}

	public String[] getLastFiles() {
		String[] retval = new String[lastUsedFiles.size()];
		for (int i = 0; i < retval.length; i++) {
			LastUsedFile lastUsedFile = lastUsedFiles.get(i);
			retval[i] = lastUsedFile.getFilename();
		}
		return retval;
	}

	public String getFilename() {
		if (this.filename == null) {
			String s = System.getProperty("org.pentaho.di.ui.PropsUIFile");
			if (s != null) {
				return s;
			} else {
				return super.getFilename();
			}
		} else {
			return this.filename;
		}
	}

	public String[] getLastDirs() {
		String[] retval = new String[lastUsedFiles.size()];
		for (int i = 0; i < retval.length; i++) {
			LastUsedFile lastUsedFile = lastUsedFiles.get(i);
			retval[i] = lastUsedFile.getDirectory();
		}
		return retval;
	}

	public boolean[] getLastTypes() {
		boolean[] retval = new boolean[lastUsedFiles.size()];
		for (int i = 0; i < retval.length; i++) {
			LastUsedFile lastUsedFile = lastUsedFiles.get(i);
			retval[i] = lastUsedFile.isSourceRepository();
		}
		return retval;
	}

	public String[] getLastRepositories() {
		String[] retval = new String[lastUsedFiles.size()];
		for (int i = 0; i < retval.length; i++) {
			LastUsedFile lastUsedFile = lastUsedFiles.get(i);
			retval[i] = lastUsedFile.getRepositoryName();
		}
		return retval;
	}

	public boolean isSVGEnabled() {
		String enabled = properties.getProperty(STRING_SVG_ENABLED, YES);
		return YES.equalsIgnoreCase(enabled); // Default: svg is enabled
	}

	public void setSVGEnabled(boolean svg) {
		properties.setProperty(STRING_SVG_ENABLED, svg ? YES : NO);
	}

	public void setIconSize(int size) {
		properties.setProperty(STRING_ICON_SIZE, "" + size);
	}

	public int getIconSize() {
		return Const.toInt(properties.getProperty(STRING_ICON_SIZE),
				ConstUI.ICON_SIZE);
	}

	public void setLineWidth(int width) {
		properties.setProperty(STRING_LINE_WIDTH, "" + width);
	}

	public int getLineWidth() {
		return Const.toInt(properties.getProperty(STRING_LINE_WIDTH),
				ConstUI.LINE_WIDTH);
	}

	public void setShadowSize(int size) {
		properties.setProperty(STRING_SHADOW_SIZE, "" + size);
	}

	public int getShadowSize() {
		return Const.toInt(properties.getProperty(STRING_SHADOW_SIZE),
				Const.SHADOW_SIZE);
	}

	public void setLastTrans(String trans) {
		properties.setProperty(STRING_LAST_PREVIEW_TRANS, trans);
	}

	public String getLastTrans() {
		return properties.getProperty(STRING_LAST_PREVIEW_TRANS, "");
	}

	public void setLastPreview(String[] lastpreview, int[] stepsize) {
		properties.setProperty(STRING_LAST_PREVIEW_STEP, ""
				+ lastpreview.length);

		for (int i = 0; i < lastpreview.length; i++) {
			properties.setProperty(STRING_LAST_PREVIEW_STEP + (i + 1),
					lastpreview[i]);
			properties.setProperty(STRING_LAST_PREVIEW_SIZE + (i + 1), ""
					+ stepsize[i]);
		}
	}

	public String[] getLastPreview() {
		String snr = properties.getProperty(STRING_LAST_PREVIEW_STEP);
		int nr = Const.toInt(snr, 0);
		String[] lp = new String[nr];
		for (int i = 0; i < nr; i++) {
			lp[i] = properties.getProperty(STRING_LAST_PREVIEW_STEP + (i + 1),
					"");
		}
		return lp;
	}

	public int[] getLastPreviewSize() {
		String snr = properties.getProperty(STRING_LAST_PREVIEW_STEP);
		int nr = Const.toInt(snr, 0);
		int[] si = new int[nr];
		for (int i = 0; i < nr; i++) {
			si[i] = Const.toInt(properties.getProperty(STRING_LAST_PREVIEW_SIZE
					+ (i + 1), ""), 0);
		}
		return si;
	}

	public void setMaxUndo(int max) {
		properties.setProperty(STRING_MAX_UNDO, "" + max);
	}

	public int getMaxUndo() {
		return Const.toInt(properties.getProperty(STRING_MAX_UNDO),
				Const.MAX_UNDO);
	}

	public void setMiddlePct(int pct) {
		properties.setProperty(STRING_MIDDLE_PCT, "" + pct);
	}

	public int getMiddlePct() {
		return Const.toInt(properties.getProperty(STRING_MIDDLE_PCT),
				Const.MIDDLE_PCT);
	}

	public void setScreen(WindowProperty winprop) {
		screens.put(winprop.getName(), winprop);
	}

	public WindowProperty getScreen(String windowname) {
		if (windowname == null) {
			return null;
		}
		return screens.get(windowname);
	}

	public void setSashWeights(int[] w) {
		properties.setProperty(STRING_SASH_W1, "" + w[0]);
		properties.setProperty(STRING_SASH_W2, "" + w[1]);
	}

	public int[] getSashWeights() {
		int w1 = Const.toInt(properties.getProperty(STRING_SASH_W1), 25);
		int w2 = Const.toInt(properties.getProperty(STRING_SASH_W2), 75);

		return new int[] { w1, w2 };
	}

	public void setOpenLastFile(boolean open) {
		properties.setProperty(STRING_OPEN_LAST_FILE, open ? YES : NO);
	}

	public boolean openLastFile() {
		String open = properties.getProperty(STRING_OPEN_LAST_FILE);
		return !NO.equalsIgnoreCase(open);
	}

	public void setAutoSave(boolean autosave) {
		properties.setProperty(STRING_AUTO_SAVE, autosave ? YES : NO);
	}

	public boolean getAutoSave() {
		String autosave = properties.getProperty(STRING_AUTO_SAVE);
		return YES.equalsIgnoreCase(autosave); // Default = OFF
	}

	public void setSaveConfirmation(boolean saveconf) {
		properties.setProperty(STRING_SAVE_CONF, saveconf ? YES : NO);
	}

	public boolean getSaveConfirmation() {
		String saveconf = properties.getProperty(STRING_SAVE_CONF);
		return YES.equalsIgnoreCase(saveconf); // Default = OFF
	}

	public void setAutoSplit(boolean autosplit) {
		properties.setProperty(STRING_AUTO_SPLIT, autosplit ? YES : NO);
	}

	public boolean getAutoSplit() {
		String autosplit = properties.getProperty(STRING_AUTO_SPLIT);
		return YES.equalsIgnoreCase(autosplit); // Default = OFF
	}

	public void setAutoCollapseCoreObjectsTree(boolean autoCollapse) {
		properties.setProperty(STRING_AUTO_COLLAPSE_CORE_TREE,
				autoCollapse ? YES : NO);
	}

	public boolean getAutoCollapseCoreObjectsTree() {
		String autoCollapse = properties
				.getProperty(STRING_AUTO_COLLAPSE_CORE_TREE);
		return YES.equalsIgnoreCase(autoCollapse); // Default = OFF
	}

	public boolean showRepositoriesDialogAtStartup() {
		String show = properties
				.getProperty(STRING_START_SHOW_REPOSITORIES, NO);
		return YES.equalsIgnoreCase(show); // Default: show warning before tool
											// exit.
	}

	public void setExitWarningShown(boolean show) {
		properties.setProperty(STRING_SHOW_EXIT_WARNING, show ? YES : NO);
	}

	public boolean isAntiAliasingEnabled() {
		String anti = properties.getProperty(STRING_ANTI_ALIASING, YES);
		return YES.equalsIgnoreCase(anti); // Default: don't do anti-aliasing
	}

	public void setAntiAliasingEnabled(boolean anti) {
		properties.setProperty(STRING_ANTI_ALIASING, anti ? YES : NO);
	}

	public boolean isShowCanvasGridEnabled() {
		String showCanvas = properties.getProperty(STRING_SHOW_CANVAS_GRID, NO);
		return YES.equalsIgnoreCase(showCanvas); // Default: don't show canvas
													// grid
	}

	public void setShowCanvasGridEnabled(boolean anti) {
		properties.setProperty(STRING_SHOW_CANVAS_GRID, anti ? YES : NO);
	}

	public boolean showExitWarning() {
		String show = properties.getProperty(STRING_SHOW_EXIT_WARNING, YES);
		return YES.equalsIgnoreCase(show); // Default: show repositories dialog
											// at startup
	}

	public void setRepositoriesDialogAtStartupShown(boolean show) {
		properties.setProperty(STRING_START_SHOW_REPOSITORIES, show ? YES : NO);
	}

	public boolean isOSLookShown() {
		String show = properties.getProperty(STRING_SHOW_OS_LOOK, NO);
		return YES.equalsIgnoreCase(show); // Default: don't show gray dialog
											// boxes, show Kettle look.
	}

	public void setOSLookShown(boolean show) {
		properties.setProperty(STRING_SHOW_OS_LOOK, show ? YES : NO);
	}

	public void setDefaultPreviewSize(int size) {
		properties.setProperty(STRING_DEFAULT_PREVIEW_SIZE, "" + size);
	}

	public int getDefaultPreviewSize() {
		return Const.toInt(properties.getProperty(STRING_DEFAULT_PREVIEW_SIZE),
				1000);
	}

	public boolean showCopyOrDistributeWarning() {
		String show = properties.getProperty(
				STRING_SHOW_COPY_OR_DISTRIBUTE_WARNING, YES);
		return YES.equalsIgnoreCase(show);
	}

	public void setShowCopyOrDistributeWarning(boolean show) {
		properties.setProperty(STRING_SHOW_COPY_OR_DISTRIBUTE_WARNING,
				show ? YES : NO);
	}

	public boolean showWelcomePageOnStartup() {
		String show = properties.getProperty(
				STRING_SHOW_WELCOME_PAGE_ON_STARTUP, YES);
		return YES.equalsIgnoreCase(show);
	}

	public void setShowWelcomePageOnStartup(boolean show) {
		properties.setProperty(STRING_SHOW_WELCOME_PAGE_ON_STARTUP, show ? YES
				: NO);
	}

	public boolean isBrandingActive() {
		String show = properties.getProperty(STRING_SHOW_BRANDING_GRAPHICS, NO);
		return YES.equalsIgnoreCase(show);
	}

	public void setBrandingActive(boolean active) {
		properties
				.setProperty(STRING_SHOW_BRANDING_GRAPHICS, active ? YES : NO);
	}

	public boolean isOnlyActiveFileShownInTree() {
		String show = properties.getProperty(STRING_ONLY_SHOW_ACTIVE_FILE, YES);
		return YES.equalsIgnoreCase(show);
	}

	public void setOnlyActiveFileShownInTree(boolean show) {
		properties.setProperty(STRING_ONLY_SHOW_ACTIVE_FILE, show ? YES : NO);
	}

	public boolean showToolTips() {
		return YES
				.equalsIgnoreCase(properties.getProperty(SHOW_TOOL_TIPS, YES));
	}

	public void setShowToolTips(boolean show) {
		properties.setProperty(SHOW_TOOL_TIPS, show ? YES : NO);
	}

	public List<GUIOption<Object>> getRegisteredEditableComponents() {
		return editables;
	}

	public boolean isShowingHelpToolTips() {
		return YES.equalsIgnoreCase(properties.getProperty(SHOW_HELP_TOOL_TIPS,
				YES));
	}

	public void setShowingHelpToolTips(boolean show) {
		properties.setProperty(SHOW_HELP_TOOL_TIPS, show ? YES : NO);
	}

	/**
	 * @return the openTabFiles
	 */
	public List<LastUsedFile> getOpenTabFiles() {
		return openTabFiles;
	}

	/**
	 * @param openTabFiles
	 *            the openTabFiles to set
	 */
	public void setOpenTabFiles(List<LastUsedFile> openTabFiles) {
		this.openTabFiles = openTabFiles;
	}

	public int getCanvasGridSize() {
		return Const.toInt(properties.getProperty(CANVAS_GRID_SIZE, "16"), 16);
	}

	public void setCanvasGridSize(int gridSize) {
		properties.setProperty(CANVAS_GRID_SIZE, Integer.toString(gridSize));
	}

	public boolean isLegacyPerspectiveMode() {
		return "Y".equalsIgnoreCase(properties.getProperty(
				LEGACY_PERSPECTIVE_MODE, "N"));
	}

	public static void setLocation(GUIPositionInterface guiElement, int x, int y) {
		if (x < 0) {
			x = 0;
		}
		if (y < 0) {
			y = 0;
		}
		guiElement.setLocation(calculateGridPosition(new Point(x, y)));
	}

	public static Point calculateGridPosition(Point p) {
		int gridSize = PropsUI.getInstance().getCanvasGridSize();
		if (gridSize > 1) {
			// Snap to grid...
			//
			return new Point(gridSize * Math.round(p.x / gridSize), gridSize
					* Math.round(p.y / gridSize));
		} else {
			// Normal draw
			//
			return p;
		}
	}

	public boolean isIndicateSlowTransStepsEnabled() {
		String indicate = properties.getProperty(
				STRING_INDICATE_SLOW_TRANS_STEPS, "Y");
		return YES.equalsIgnoreCase(indicate);
	}

	public void setIndicateSlowTransStepsEnabled(boolean indicate) {
		properties.setProperty(STRING_INDICATE_SLOW_TRANS_STEPS, indicate ? YES : NO);
	}
}
