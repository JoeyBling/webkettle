BaseGraph = Ext.extend(Ext.Panel, {
	layout: 'border',
	defaults: {border: false},
	title: '正在加载...',
	closable: true,
	readOnly: false,
	showResult: false,
	Executable:false,

	initComponent: function() {
		var graphPanel = new Ext.Panel({
			region: 'center',
			bodyStyle:'overflow: auto'
		});
		
		this.items.push(graphPanel);
		
		graphPanel.on('afterrender', function(comp) {
			var container = comp.body.dom;
			this.initGraph(container);
			this.installDragDrop(container);
			
			if(this.readOnly === false) {
				this.installPopupMenu(container);
				this.installKeyHandler();
			}
		}, this);
		
		BaseGraph.superclass.initComponent.call(this);
		this.addEvents('load', 'initgraph');
		
		this.on('load', function() {
			var graph = this.getGraph();
			var cell = graph.getDefaultParent();
			this.setTitle(cell.getAttribute('name'));
		}, this);
		
		graphPanel.on('resize', function() {
			this.getGraph().sizeDidChange();
		}, this);
	},
	
	initGraph: function(container) {
		var graph = new mxGraph(container);
		var node = mxUtils.load(GetUrl('mxgraph2/style/default-style.xml?_dc='+new Date().getTime())).getDocumentElement();
		var dec = new mxCodec(node.ownerDocument);
		dec.decode(node, graph.getStylesheet());
		
		new mxRubberband(graph);
		graph.setTooltips(true);
		graph.setPanning(true);
		graph.setConnectable(true);
		graph.setDropEnabled(true);
		
		graph.setAllowDanglingEdges(false);
		graph.setDisconnectOnMove(false);
		
		graph.setCellsEditable(false);
		container.style.background = 'url("' + GetUrl('ui/images/grid.gif') + '") repeat white';
		container.style.cursor = 'hand';
		
		var doInsert = mxCell.prototype.insert, me = this;
		mxCell.prototype.insert = function(child, index) {
			child = doInsert.apply(this, arguments);
			
			if(child.value) {
				if(child.getAttribute('draw') == 'N') {
					child.setVisible(false);
				}
				if(child.getAttribute('ctype'))
					loadPluginScript(child.getAttribute('ctype'));
				
				if(child.value.nodeName == 'NotePad') {
					child.setConnectable(false);
				}
			}
			
			return child;
		};
		
		graph.convertValueToString = function(cell){  
			var label = cell.getAttribute('label');
			if(label) {
				if(cell.isEdge() && cell.value.nodeName == 'TransHop') {
					return '<img src="' + label + '" width="16" height="16" />';
				} else if(cell.isEdge() && cell.value.nodeName == 'JobHop') {
					var jsonArray = Ext.decode(label), label = '';
					Ext.each(jsonArray, function(img) {
						label += '<img src="' + img + '" width="16" height="16" />';
					});
					return label;
				} else {
					return decodeURIComponent(label);
				}
			}
			
			return label;
		};
		var cellLabelChanged = graph.cellLabelChanged;
		graph.cellLabelChanged = function(cell, newValue, autoSize) 
		{
			var tmp = cell.value.cloneNode(true);
			tmp.setAttribute('label', newValue);
			newValue = tmp;
			
			cellLabelChanged.apply(this, arguments);
		};
		
		
		graph.getModel().addListener(mxEvent.CHANGE, function(sender, evt){  
			Ext.each(evt.getProperty('edit').changes, function(change) {
				if (change.constructor == mxCellAttributeChange && change.cell != null)    {
					var cell = change.cell, root = graph.getDefaultParent();
					if(cell.getId() == root.getId()) {
						me.getDatabaseStore();
						me.getSlaveServerStore();
					}
				}
			});
		});
		
		graph.addListener(mxEvent.CELLS_ADDED, function(sender, evt){  
			var cells = evt.getProperty('cells');
			Ext.each(cells, function(cell) {
				if(cell.isEdge() && !cell.value) {
					me.newHop(cell);
				}
			});
		});

		if(!this.readOnly && !this.Executable){
			graph.addListener(mxEvent.DOUBLE_CLICK, function(sender, evt){
				var cell = evt.getProperty('cell');
				if(cell && cell.isVertex()) {
					if(cell.value.nodeName != 'NotePad') {
						me.editCell(cell);
					} else {
						graph.startEditingAtCell(cell);
					}

				}
			});
		}

		
		this.fireEvent('initgraph', graph);
		
		this.getGraph = function() {
			return graph;
		};
		
		this.graphXml = function() {
			var enc = new mxCodec(mxUtils.createXmlDocument());
			var node = enc.encode(graph.getModel());
			return mxUtils.getPrettyXml(node);
		};
	},
	
	installDragDrop: function(ct) {
		var me = this;
		new Ext.dd.DropTarget(ct,
        {
       		ddGroup: 'TreePanelDDGroup',  
            notifyDrop: function(ddSource, e, data) {  
            	var xy1 = Ext.fly(ct).getXY(), xy2 = e.getXY();
         		var top = xy2[1] - xy1[1], left = xy2[0]-xy1[0];
				me.newStep(data.node, left, top, kettle.step_size, kettle.step_size);
         		return true;
            }
        });
	},
	
	installPopupMenu: function(container) {
		var graph = this.getGraph();
		
		var textEditing =  mxUtils.bind(this, function(evt)
		{
			if (evt == null)
			{
				evt = window.event;
			}
			return graph.isEditing();
		});
		if (mxClient.IS_IE && (typeof(document.documentMode) === 'undefined' || document.documentMode < 9))
		{
			mxEvent.addListener(container, 'contextmenu', textEditing);
		}
		else
		{
			container.oncontextmenu = textEditing;
		}
		var graphFireMouseEvent = graph.fireMouseEvent;
	   	graph.fireMouseEvent = function(evtName, me, sender)
	   	{
	   		if (evtName == mxEvent.MOUSE_DOWN)
	   		{
	   			this.container.focus();
	   		}
	   		
	   		graphFireMouseEvent.apply(this, arguments);
	   	};
	   	graph.popupMenuHandler.autoExpand = true;
		graph.popupMenuHandler.factoryMethod = mxUtils.bind(this, this.initContextMenu);
		mxEvent.addGestureListeners(document, mxUtils.bind(this, function(evt)
		{
			graph.popupMenuHandler.hideMenu();
		}));
	},
	
	installKeyHandler: function() {
		var graph = this.getGraph();
		var history = new mxUndoManager();
		var undoHandler = function(sender, evt)
		{
			var changes = evt.getProperty('edit').changes;
			graph.setSelectionCells(graph.getSelectionCellsForChanges(changes));
		};
		
		history.addListener(mxEvent.UNDO, undoHandler);
		history.addListener(mxEvent.REDO, undoHandler);
		
		var listener = function(sender, evt)
		{
			history.undoableEditHappened(evt.getProperty('edit'));
		};
		
		graph.getModel().addListener(mxEvent.UNDO, listener);
		graph.getView().addListener(mxEvent.UNDO, listener);
		
		var keyHandler = new mxKeyHandler(graph);
	    
	    // Ignores enter keystroke. Remove this line if you want the
	    // enter keystroke to stop editing
	    keyHandler.enter = function() {};
	    
	    keyHandler.bindKey(8, function()
	    {
	    	graph.foldCells(true);
	    });
	    
	    keyHandler.bindKey(13, function()
	    {
	    	graph.foldCells(false);
	    });
	    
	    keyHandler.bindKey(33, function()
	    {
	    	graph.exitGroup();
	    });
	    
	    keyHandler.bindKey(34, function()
	    {
	    	graph.enterGroup();
	    });
	    
	    keyHandler.bindKey(36, function()
	    {
	    	graph.home();
	    });

	    keyHandler.bindKey(35, function()
	    {
	    	graph.refresh();
	    });
	    
	    keyHandler.bindKey(37, function()
	    {
	    	graph.selectPreviousCell();
	    });
	        
	    keyHandler.bindKey(38, function()
	    {
	    	graph.selectParentCell();
	    });

	    keyHandler.bindKey(39, function()
	    {
	    	graph.selectNextCell();
	    });
	    
	    keyHandler.bindKey(40, function()
	    {
	    	graph.selectChildCell();
	    });
	    
	    keyHandler.bindKey(46, function()
	    {
	    	graph.removeCells();
	    });
	    
	    keyHandler.bindKey(107, function()
	    {
	    	graph.zoomIn();
	    });
	    
	    keyHandler.bindKey(109, function()
	    {
	    	graph.zoomOut();
	    });
	    
	    keyHandler.bindKey(113, function()
	    {
	    	graph.startEditingAtCell();
	    });
	  
	    keyHandler.bindControlKey(65, function()
	    {
	    	graph.selectVertices();
	    });

	    keyHandler.bindControlKey(89, function()
	    {
	    	history.redo();
	    });
	    
	    keyHandler.bindControlKey(90, function()
	    {
	    	history.undo();
	    });
	    
	    keyHandler.bindControlKey(88, function()
	    {
	    	mxClipboard.cut(graph);
	    });
	    
	    keyHandler.bindControlKey(67, function()
	    {
	    	mxClipboard.copy(graph);
	    });
	    
	    keyHandler.bindControlKey(86, function()
	    {
	    	mxClipboard.paste(graph);
	    });
	    
	    keyHandler.bindControlKey(71, function()
	    {
	    	graph.setSelectionCell(graph.groupCells(null, 20));
	    });
	    
	    keyHandler.bindControlKey(85, function()
	    {
	    	graph.setSelectionCells(graph.ungroupCells());
	    });
	},
	
	initContextMenu: Ext.emptyFn,
	newHop: Ext.emptyFn,
	
	editCell: function(cell) {
		var pluginType = cell.getAttribute('ctype');
		if(Ext.ComponentMgr.isRegistered(pluginType) === true) {
			if(!(pluginType == 'SPECIAL' && cell.getAttribute('dummy') == 'Y')) {
				var dialog = Ext.create({data: cell}, pluginType);
				dialog.show();
			}
		} else {
			Ext.Msg.show({
			   title: '系统提示',
			   msg: '该插件[' + pluginType + ']待实现，请联系lhy249056652@sina.com',
			   buttons: Ext.Msg.OK,
			   icon: Ext.MessageBox.WARNING
			});
		}
	},
	
	toXml: function() {
		var enc = new mxCodec(mxUtils.createXmlDocument());
		var node = enc.encode(this.getGraph().getModel());
		return mxUtils.getPrettyXml(node);
	},

	getDatabaseStoreAll: function() {
		var proxy=new Ext.data.HttpProxy({url:"/common/getDatabases.do"});
		var data=Ext.data.Record.create([
			{name:"name",type:"String",mapping:"name"}
		]);
		var reader=new Ext.data.JsonReader({},data);
		var store=new Ext.data.Store({
			proxy:proxy,
			reader:reader
		});
		return store;
	},

	getDatabaseStore: function() {
		if(!this.databaseStore) {
			this.databaseStore = new Ext.data.JsonStore({
				idProperty: 'name',
				fields: ['name']
			});
		}
		var graph = this.getGraph();
		var root = graph.getDefaultParent(), data = [];
		if(root.getAttribute('databases') != null){
			data = Ext.decode(root.getAttribute('databases'));
		}
		this.databaseStore.loadData(data);
		return this.databaseStore;
	},
	
	getPartitionDatabaseStore: function() {
		var store = new Ext.data.JsonStore({
			idProperty: 'name',
			fields: ['name', 'partitionInfo']
		});
		var graph = this.getGraph();
		var root = graph.getDefaultParent(), data = [];
		if(root.getAttribute('databases') != null) {
			var databases = Ext.decode(root.getAttribute('databases'));
			Ext.each(databases, function(db) {
				if(db.partitioned == 'Y')
					data.push(db);
			});
		}
	},
	
	onDatabaseMerge: function(json) {
		var graph = this.getGraph();
		var root = graph.getDefaultParent();
		var databases = root.getAttribute('databases');
		var jsonArray = Ext.decode(databases);
		
		if(jsonArray.length == 0) {
			jsonArray.push(json);
		} else {
			Ext.each(jsonArray, function(item, index) {
				if(item.name == json.name) {
					jsonArray.splice(index, 1, json);
				} else {
					if(index == jsonArray.length - 1)
						jsonArray.push(json);
				}
			});
		}
		
		graph.getModel().beginUpdate();
        try
        {
			var edit = new mxCellAttributeChange(root, 'databases', Ext.encode(jsonArray));
        	graph.getModel().execute(edit);
        } finally
        {
            graph.getModel().endUpdate();
        }
	},
	
	getSlaveServerStore: function() {
		if(!this.slaveServerStore) {
			this.slaveServerStore = new Ext.data.JsonStore({
				idProperty: 'name',
				fields: ['name', 'hostname', 'port', 'webAppName', 'username', 'password', 'master']
			});
		}
		var graph = this.getGraph();
		var cell = graph.getDefaultParent(), data = [];
		if(cell.getAttribute('slaveServers') != null)
			data = Ext.decode(cell.getAttribute('slaveServers'));
		this.slaveServerStore.loadData(data);
		return this.slaveServerStore;
	},
	
	getSlaveServerData: function() {
		var graph = this.getGraph();
		var cell = graph.getDefaultParent(), data = [];
		if(cell.getAttribute('slaveServers') != null)
			data = Ext.decode(cell.getAttribute('slaveServers'));
		
		return data;
	},
	
	onSlaveServerMerge: function(json) {
		var graph = this.getGraph();
		var root = graph.getDefaultParent();
		var slaveServers = root.getAttribute('slaveServers');
		var jsonArray = Ext.decode(slaveServers);
		
		if(jsonArray.length == 0) {
			jsonArray.push(json);
		} else {
			Ext.each(jsonArray, function(item, index) {
				if(item.name == json.name) {
					jsonArray.splice(index, 1, json);
				} else {
					if(index == jsonArray.length - 1)
						jsonArray.push(json);
				}
			});
		}
		
		graph.getModel().beginUpdate();
        try
        {
			var edit = new mxCellAttributeChange(root, 'slaveServers', Ext.encode(jsonArray));
        	graph.getModel().execute(edit);
        } finally
        {
            graph.getModel().endUpdate();
        }
	},
	
	onSlaveServerDel: function(name) {
		var graph = this.getGraph();
		var root = graph.getDefaultParent();
		var slaveServers = root.getAttribute('slaveServers');
		var jsonArray = Ext.decode(slaveServers);
		
		Ext.each(jsonArray, function(item, index) {
			if(item.name == name) {
				jsonArray.splice(index, 1);
				return false;
			}
		});
		
		graph.getModel().beginUpdate();
        try
        {
			var edit = new mxCellAttributeChange(root, 'slaveServers', Ext.encode(jsonArray));
        	graph.getModel().execute(edit);
        } finally
        {
            graph.getModel().endUpdate();
        }
	},
	
	tableFields: function(connection, schema, table, cb) {
		var store = new Ext.data.JsonStore({
			idProperty: 'name',
			fields: ['name'],
			proxy: new Ext.data.HttpProxy({
				url: GetUrl('trans/tableFields.do'),
				method: 'POST'
			})
		});
		
		store.on('load', function() {
			if(Ext.isFunction(cb))
				cb(store);
		});
		
		store.baseParams.graphXml = this.toXml();
		store.baseParams.databaseName = connection;
		store.baseParams.schema = schema;
		store.baseParams.table = table;
		
		return store;
	},

	showSlaves: function() {
		var dialog = new SlaveServersDialog();
		dialog.show();
	},
	
	createNote: function(evt) {
		var graph = this.getGraph();
		var pt = graph.getPointForEvent(evt);
		
		var doc = mxUtils.createXmlDocument();
		var note = doc.createElement('NotePad');
		note.setAttribute('label', '注释');
		
		var style = 'shape=note;fillColor=#FFCD70;fontColor=#000000;strokeColor=#646464';
		
//		note.setAttribute('from', edge.source.getAttribute('label'));
//		note.setAttribute('to', edge.target.getAttribute('label'));
//		note.setAttribute('enable', 'Y');
		
		
		var cell = graph.insertVertex(graph.getDefaultParent(), null, note, pt.x, pt.y, 100, 100, style);
		graph.startEditingAtCell(cell);
	},
	
	listParameters: function() {
		//TODO
	}
});