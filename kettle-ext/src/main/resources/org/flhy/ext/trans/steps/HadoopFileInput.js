
HadoopFileInput = Ext.extend(KettleTabDialog, {
    width: 700,
    height: 600,
    showPreview:true,
    title: 'Hadoop输入',
    initComponent: function() {
        var me = this,  graph = getActiveGraph().getGraph(),  cell = graph.getSelectionCell();

        var fileNameStore  = new Ext.data.JsonStore({
            idProperty: 'fileName',
            fields: ['fileName', 'filemask','excludeFileMask', 'fileRequired', 'includeSubFolders'],
            data: Ext.decode(cell.getAttribute('file') || Ext.encode([]))
        });
        var fileNamegrid = new KettleEditorGrid({
            fieldLabel: '选中的文件',
            height:300,
            region: 'center',
            disabled: false,
            columns: [
                {
                    header: '文件/目录', dataIndex: 'fileName', width: 100, editor: new Ext.form.TextField()
                },{
                    header: '通配符', dataIndex: 'filemask', width: 100, editor: new Ext.form.TextField()
                },{
                    header: '通配符号（排除）', dataIndex: 'excludeFileMask', width: 60, editor: new Ext.form.TextField()
                },{
                    header: '要求', dataIndex: 'fileRequired', width: 100, editor: new Ext.form.TextField()
                },{
                    header: '包含子目录', dataIndex: 'includeSubFolders', width: 80, editor: new Ext.form.TextField()
                }],
            store: fileNameStore
        });
        var wAcceptingFilenames = new Ext.form.Checkbox({
            fieldLabel: '从以前步骤接受文件名',
            checked: cell.getAttribute('acceptingFilenames') == 'Y',
            listeners:{
                'check':function(checked){
                    if(checked.checked)
                    {
                        fileNamegrid.setDisabled(true);
                        wPassingThruFields.setDisabled(false);
                        wAcceptingField.setDisabled(false);
                        wAcceptingStepName.setDisabled(false);

                    }else{

                        fileNamegrid.setDisabled(false);
                        wPassingThruFields.setDisabled(true);
                        wAcceptingField.setDisabled(true);
                        wAcceptingStepName.setDisabled(true);
                    }
                }
            }
        });
        var wPassingThruFields = new Ext.form.Checkbox({fieldLabel: '从以前步骤接受字段名', checked: cell.getAttribute('passingThruFields') == 'Y'});
        var wAcceptingField = new Ext.form.TextField({fieldLabel: '步骤读取的文件名来自', flex: 1,anchor: '-10',value: cell.getAttribute('acceptingField') });
        var wAcceptingStepName = new Ext.form.TextField({fieldLabel: '在输入里的字段被当做文件名', flex: 1,anchor: '-10',value: cell.getAttribute('acceptingStepName') });

        var wFileType = new Ext.form.ComboBox({
            fieldLabel: '文件类型',
            anchor: '-10',
            displayField: 'name',
            valueField: 'name',
            typeAhead: true,
            forceSelection: true,
            triggerAction: 'all',
            selectOnFocus:true,
            value: cell.getAttribute('fileType')
        });
        var wSeparator = new Ext.form.TextField({fieldLabel: '分隔符',flex: 1, anchor: '-10', value: cell.getAttribute('separator')});
        var wEnclosure = new Ext.form.TextField({fieldLabel: '文本限定符', flex: 1,anchor: '-10',value: cell.getAttribute('enclosure')});
        var wBreakInEnclosureAllowed = new Ext.form.Checkbox({fieldLabel: '在文本里允许换行',anchor: '-10', checked: cell.getAttribute('breakInEnclosureAllowed') == 'Y'});
        var wEscapeCharacter = new Ext.form.TextField({fieldLabel: '逃逸字符',flex: 1,anchor: '-10', value: cell.getAttribute('escapeCharacter') });
        var wHeader = new Ext.form.Checkbox({fieldLabel: '头部',anchor: '-10',
            checked: cell.getAttribute('header')  == 'Y',
            listeners:{
                'check':function(checked){
                    if(checked.checked)
                    {
                        wNrHeaderLines.setDisabled(false);
                    }else{
                        wNrHeaderLines.setDisabled(true);
                    }
                }
            }
        });
        var wNrHeaderLines = new Ext.form.TextField({fieldLabel: '头部行数',flex: 1,anchor: '0', value: cell.getAttribute('nrHeaderLines') });
        var wFooter = new Ext.form.Checkbox({fieldLabel: '尾部',anchor: '-10', checked: cell.getAttribute('footer')  == 'Y',
            listeners:{
                'check':function(checked){
                    if(checked.checked)
                    {
                        wNrFooterLines.setDisabled(false);
                    }else{
                        wNrFooterLines.setDisabled(true);
                    }
                }
            }
        });
        var wNrFooterLines = new Ext.form.TextField({fieldLabel: '尾部行数',flex: 1,anchor: '0', value: cell.getAttribute('nrFooterLines') });
        var wLineWrapped = new Ext.form.Checkbox({fieldLabel: '包装行',anchor: '-10', checked: cell.getAttribute('lineWrapped')  == 'Y',
            listeners:{
                'check':function(checked){
                    if(checked.checked)
                    {
                        wNrWraps.setDisabled(false);
                    }else{
                        wNrWraps.setDisabled(true);
                    }
                }
            }
        });
        var wNrWraps = new Ext.form.TextField({fieldLabel: '以时间包装的行数',anchor: '0',flex: 1, value: cell.getAttribute('nrWraps') });
        var wLayoutPaged = new Ext.form.Checkbox({fieldLabel: '分页布局（printout）',anchor: '-10', checked: cell.getAttribute('layoutPaged')  == 'Y',
            listeners:{
                'check':function(checked){
                    if(checked.checked)
                    {
                        wNrLinesPerPage.setDisabled(false);
                        wNrLinesDocHeader.setDisabled(false);
                    }else{
                        wNrLinesPerPage.setDisabled(true);
                        wNrLinesDocHeader.setDisabled(true);
                    }
                }
            }
        });
        var wNrLinesPerPage = new Ext.form.TextField({fieldLabel: '每页记录行数',anchor: '0', flex: 1,value: cell.getAttribute('nrLinesPerPage') });
        var wNrLinesDocHeader = new Ext.form.TextField({fieldLabel: '文档头部行',anchor: '0', flex: 1,value: cell.getAttribute('nrLinesDocHeader') });
        var wFileCompression = new Ext.form.ComboBox({
            fieldLabel: '压缩',
            anchor: '-10',
            displayField: 'name',
            valueField: 'name',
            typeAhead: true,
            forceSelection: true,
            triggerAction: 'all',
            selectOnFocus:true,
            store: Ext.StoreMgr.get('datetimeFormatStore'),
            value: cell.getAttribute('fileCompression')
        });
        var wNoEmptyLines = new Ext.form.Checkbox({fieldLabel: '没有空行', checked: cell.getAttribute('noEmptyLines') == 'Y'});
        var wIncludeFilename = new Ext.form.Checkbox({fieldLabel: '在输出包含字段名',anchor: '-10', checked: cell.getAttribute('includeFilename')  == 'Y',
            listeners:{
                'check':function(checked){
                    if(checked.checked)
                    {
                        wFilenameField.setDisabled(false);
                    }else{
                        wFilenameField.setDisabled(true);
                    }
                }
            }
        });
        var wFilenameField = new Ext.form.TextField({fieldLabel: '包含字段名名称',flex: 1,anchor: '0', value: cell.getAttribute('filenameField') });
        var wIncludeRowNumber = new Ext.form.Checkbox({fieldLabel: '输出包含行数',anchor: '-10', checked: cell.getAttribute('includeRowNumber')  == 'Y',
            listeners:{
                'check':function(checked){
                    if(checked.checked)
                    {
                        wRowNumberField.setDisabled(false);
                        wRowNumberByFile.setDisabled(false);
                    }else{
                        wRowNumberField.setDisabled(true);
                        wRowNumberByFile.setDisabled(true);
                    }
                }
            }
        });
        var wRowNumberField = new Ext.form.TextField({fieldLabel: '行数字段名称',flex: 1,anchor: '0', value: cell.getAttribute('rowNumberField') });
        var wRowNumberByFile = new Ext.form.Checkbox({fieldLabel: '按文件取行号',flex: 1,anchor: '0', value: cell.getAttribute('rowNumberByFile') });
        var wFileFormat = new Ext.form.ComboBox({
            fieldLabel: '格式',
            anchor: '-10',
            displayField: 'name',
            valueField: 'name',
            typeAhead: true,
            forceSelection: true,
            triggerAction: 'all',
            selectOnFocus:true,
            store: Ext.StoreMgr.get('formatMapperLineTerminatorStore'),
            value: cell.getAttribute('fileFormat')
        });
        var wEncoding = new Ext.form.ComboBox({
            fieldLabel: '编码',
            anchor: '-10',
            displayField: 'name',
            valueField: 'name',
            typeAhead: true,
            forceSelection: true,
            triggerAction: 'all',
            selectOnFocus:true,
            store: Ext.StoreMgr.get('availableCharsetsStore'),
            value: cell.getAttribute('encoding')
        });
        var wRowLimit = new Ext.form.TextField({fieldLabel: '记录数量限制', flex: 1,anchor: '-10',  value: cell.getAttribute('rowLimit')});
        var wDateFormatLenient = new Ext.form.Checkbox({fieldLabel: '解析日期的时候是否严格要求',  anchor: '-10', checked: cell.getAttribute('dateFormatLenient') == 'Y'});
        var wDateFormatLocale = new Ext.form.ComboBox({fieldLabel: '本地日期格式', flex: 1,anchor: '-10', value: cell.getAttribute('dateFormatLocale')});
        var wAddresult = new Ext.form.Checkbox({fieldLabel: '添加文件名', anchor: '-10', checked: cell.getAttribute('addresult') == 'Y'});
        var wErrorIgnored = new Ext.form.Checkbox({fieldLabel: '忽略错误', flex: 1,anchor: '-10', checked: cell.getAttribute('errorIgnored'),
            listeners:{
                'check':function(checked){
                    if(checked.checked)
                    {
                        wErrorLineSkipped.setDisabled(false);
                        wErrorCountField.setDisabled(false);
                        wErrorFieldsField.setDisabled(false);
                        wErrorTextField.setDisabled(false);
                        wWarningFilesDestinationDirectory.setDisabled(false);
                        wErrorFilesDestinationDirectory.setDisabled(false);
                        wLineNumberFilesDestinationDirectory.setDisabled(false);
                        wWarningFilesExtension.setDisabled(false);
                        wErrorFilesExtension.setDisabled(false);
                        wLineNumberFilesExtension.setDisabled(false);
                        wWarningFilesFindButton.setDisabled(false);
                        wLineNumberFindButton.setDisabled(false);
                        wErrorFilesFindButton.setDisabled(false);
                    }else{
                        wErrorLineSkipped.setDisabled(true);
                        wErrorCountField.setDisabled(true);
                        wErrorFieldsField.setDisabled(true);
                        wErrorTextField.setDisabled(true);
                        wWarningFilesDestinationDirectory.setDisabled(true);
                        wErrorFilesDestinationDirectory.setDisabled(true);
                        wLineNumberFilesDestinationDirectory.setDisabled(true);
                        wWarningFilesExtension.setDisabled(true);
                        wErrorFilesExtension.setDisabled(true);
                        wLineNumberFilesExtension.setDisabled(true);
                        wWarningFilesFindButton.setDisabled(true);
                        wLineNumberFindButton.setDisabled(true);
                        wErrorFilesFindButton.setDisabled(true);

                    }
                }
            }
        });


        var wErrorLineSkipped = new Ext.form.Checkbox({fieldLabel: '跳过错误行', flex: 1,anchor: '-10', checked: cell.getAttribute('errorLineSkipped')});
        var wErrorCountField = new Ext.form.TextField({fieldLabel: '错误计数制度', flex: 1,anchor: '-10', value: cell.getAttribute('errorCountField')});
        var wErrorFieldsField = new Ext.form.TextField({fieldLabel: '错误字段文件名', flex: 1,anchor: '-10', value: cell.getAttribute('errorFieldsField')});
        var wErrorTextField = new Ext.form.TextField({fieldLabel: '错误文本字段', flex: 1,anchor: '-10', value: cell.getAttribute('errorTextField')});
        var wWarningFilesDestinationDirectory = new Ext.form.TextField({fieldLabel: '告警文件目录', flex: 1,anchor: '-10', value: cell.getAttribute('warningFilesDestinationDirectory')});
        var wErrorFilesDestinationDirectory = new Ext.form.TextField({fieldLabel: '错误文件目录', flex: 1,anchor: '-10', value: cell.getAttribute('errorFilesDestinationDirectory')});
        var wLineNumberFilesDestinationDirectory = new Ext.form.TextField({fieldLabel: '失败行数文件目录', flex: 1,anchor: '-10', value: cell.getAttribute('lineNumberFilesDestinationDirectory')});
        var wWarningFilesExtension = new Ext.form.TextField({fieldLabel: '扩展名', flex: 1,anchor: '-10', value: cell.getAttribute('warningFilesExtension')});
        var wErrorFilesExtension = new Ext.form.TextField({fieldLabel: '扩展名', flex: 1,anchor: '-10', value: cell.getAttribute('errorFilesExtension')});
        var wLineNumberFilesExtension = new Ext.form.TextField({fieldLabel: '扩展名', flex: 1,anchor: '-10', value: cell.getAttribute('lineNumberFilesExtension')});
        var wWarningFilesFindButton = new Ext.Button({ text: '浏览(B)',
            handler: function() {
                var dialog = new FileExplorerWindow();
                dialog.on('ok', function(path) {
                    wWarningFilesDestinationDirectory.setValue(path);
                    dialog.close();
                });
                dialog.show();
            }});
        var  wErrorFilesFindButton = new Ext.Button({ text: '浏览(B)',
            handler: function() {
                var dialog = new FileExplorerWindow();
                dialog.on('ok', function(path) {
                    wErrorFilesDestinationDirectory.setValue(path);
                    dialog.close();
                });
                dialog.show();
            }});
        var wLineNumberFindButton = new Ext.Button({ text: '浏览(B)',
            handler: function() {
                var dialog = new FileExplorerWindow();
                dialog.on('ok', function(path) {
                    wLineNumberFilesDestinationDirectory.setValue(path);
                    dialog.close();
                });
                dialog.show();
            }});

        var fieldStore = new Ext.data.JsonStore({
            fields: ['name', 'type', 'format', 'position','length', 'precision', 'currencySymbol', 'decimalSymbol', 'groupSymbol', 'trimtype', 'nullif','ifnull','repeat'],
            data: Ext.decode(cell.getAttribute('fields') || Ext.encode([]))
        });

        var fieldsgrid = new KettleEditorGrid({
            region: 'center',
            title: '字段',
            menuAdd: function(menu) {
                menu.insert(0, {
                    text: '获取变量', scope: this, handler: function() {
                        me.onSure();

                        getActiveGraph().inputOutputFields(cell.getAttribute('label'), true, function(st) {
                            store.loadData(st.toJson());
                        });
                    }
                });
            },
            columns: [new Ext.grid.RowNumberer(), {
                header: '名称', dataIndex: 'name', width: 50, editor: new Ext.form.TextField({
                    allowBlank: false
                })
            },{
                header: '类型', dataIndex: 'type', width: 50, editor: new Ext.form.ComboBox({
                    store: Ext.StoreMgr.get('valueMetaStore'),
                    displayField: 'name',
                    valueField: 'name',
                    typeAhead: true,
                    mode: 'local',
                    forceSelection: true,
                    triggerAction: 'all',
                    selectOnFocus:true
                })
            },{
                header: '格式', dataIndex: 'format', width: 50, editor: new Ext.form.ComboBox({
                    store: Ext.StoreMgr.get('valueFormatStore'),
                    displayField:'name',
                    valueField:'name',
                    typeAhead: true,
                    mode: 'local',
                    forceSelection: true,
                    triggerAction: 'all',
                    selectOnFocus:true
                })
            },{
                header: '位置', dataIndex: 'position', width: 50, editor: new Ext.form.NumberField()
            },{
                header: '长度', dataIndex: 'length', width: 50, editor: new Ext.form.NumberField()
            },{
                header: '精度', dataIndex: 'precision', width: 50, editor: new Ext.form.TextField()
            },{
                header: '货币', dataIndex: 'currencySymbol', width: 50, editor: new Ext.form.TextField()
            },{
                header: '小数', dataIndex: 'decimalSymbol', width: 50, editor: new Ext.form.TextField()
            },{
                header: '分组', dataIndex: 'groupSymbol', width: 50, editor: new Ext.form.TextField()
            },{
                header: 'Null if', dataIndex: 'nullif', width: 80, editor: new Ext.form.TextField()
            },{
                header: '默认', dataIndex: 'ifnull', width: 50, editor: new Ext.form.TextField()
            },{
                header: '去除空字符串方式', dataIndex: 'trimtype', width: 100, renderer: function(v)
                {
                    if(v == 'none')
                        return '不去掉空格';
                    else if(v == 'left')
                        return '去掉左空格';
                    else if(v == 'right')
                        return '去掉右空格';
                    else if(v == 'both')
                        return '去掉左右两端空格';
                    return v;
                }, editor: new Ext.form.ComboBox({
                    store: new Ext.data.JsonStore({
                        fields: ['value', 'text'],
                        data: [{value: 'none', text: '不去掉空格'},
                            {value: 'left', text: '去掉左空格'},
                            {value: 'right', text: '去掉右空格'},
                            {value: 'both', text: '去掉左右两端空格'}]
                    }),
                    displayField: 'text',
                    valueField: 'value',
                    typeAhead: true,
                    mode: 'local',
                    forceSelection: true,
                    triggerAction: 'all',
                    selectOnFocus:true
                })
            },{
                header: '重复', dataIndex: 'repeat', width: 50, editor: new Ext.form.TextField()

            }],
            store: fieldStore
        });

        var filterStore  = new Ext.data.JsonStore({
            idProperty: 'filter',
            fields: ['filterString', 'filterPosition', 'filterLastLine', 'filterPositive'],
            data: Ext.decode(cell.getAttribute('filter') || Ext.encode([]))
        });


        var  filterGrid = new KettleEditorGrid({
            xtype:'KettleEditorGrid',
            region: 'center',
            title: '过滤',
            menuAdd: function(menu) {
                menu.insert(0, {
                    text: '获取变量', scope: this, handler: function() {
                        me.onSure();
                        getActiveGraph().inputOutputFields(cell.getAttribute('label'), true, function(st) {
                            store.loadData(st.toJson());
                        });
                    }
                });
            },
            columns: [new Ext.grid.RowNumberer(), {
                header: '过滤器字符串', dataIndex: 'filterString', width: 150, editor: new Ext.form.TextField({
                    allowBlank: false
                })
            },{header: '过滤器位置', dataIndex: 'filterPosition', width: 100, editor: new Ext.form.ComboBox({
                store: Ext.StoreMgr.get('valueFormatStore'),
                displayField:'name',
                valueField:'name',
                typeAhead: true,
                mode: 'local',
                forceSelection: true,
                triggerAction: 'all',
                selectOnFocus:true
            })
            },{
                header: '停止在过滤器', dataIndex: 'filterLastLine', width: 150, editor: new Ext.form.NumberField()
            },{
                header: '积极匹配', dataIndex: 'filterPositive', width: 100, editor: new Ext.form.TextField()
            }],
            store: filterStore
        });

        this.getValues = function(){
            return {
                acceptingFilenames: wAcceptingFilenames.getValue() ? "Y" : "N",
                passingThruFields: wPassingThruFields.getValue() ? "Y" : "N",
                acceptingField: wAcceptingField.getValue(),
                acceptingStepName: wAcceptingStepName.getValue(),
                fileType: wFileType.getValue(),
                separator: wSeparator.getValue(),
                enclosure: wEnclosure.getValue(),
                breakInEnclosureAllowed: wBreakInEnclosureAllowed.getValue() ? "Y" : "N",
                escapeCharacter: wEscapeCharacter.getValue(),
                header: wHeader.getValue() ? "Y" : "N",
                nrHeaderLines: wNrHeaderLines.getValue(),
                footer: wFooter.getValue() ? "Y" : "N",
                nrFooterLines: wNrFooterLines.getValue(),
                lineWrapped: wLineWrapped.getValue() ? "Y" : "N",
                nrWraps: wNrWraps.getValue(),
                layoutPaged: wLayoutPaged.getValue() ? "Y" : "N",
                nrLinesPerPage: wNrLinesPerPage.getValue(),
                nrLinesDocHeader: wNrLinesDocHeader.getValue(),

                fileCompression: wFileCompression.getValue(),
                noEmptyLines: wNoEmptyLines.getValue() ? "Y" : "N",
                includeFilename: wIncludeFilename.getValue() ? "Y" : "N",
                filenameField: wFilenameField.getValue(),
                includeRowNumber: wIncludeRowNumber.getValue() ? "Y" : "N",
                rowNumberField: wRowNumberField.getValue(),
                rowNumberByFile: wRowNumberByFile.getValue() ? "Y" : "N",
                fileFormat: wFileFormat.getValue(),
                encoding: wEncoding.getValue(),
                rowLimit: wRowLimit.getValue(),
                dateFormatLenient: wDateFormatLenient.getValue() ? "Y" : "N",
                dateFormatLocale: wDateFormatLocale.getValue(),
                addresult: wAddresult.getValue() ? "Y" : "N",

                errorIgnored: wErrorIgnored.getValue() ? "Y" : "N",
                errorLineSkipped: wErrorLineSkipped.getValue()  ? "Y" : "N",
                errorCountField: wErrorCountField.getValue(),
                errorFieldsField: wErrorFieldsField.getValue(),
                errorTextField: wErrorTextField.getValue(),
                warningFilesDestinationDirectory: wWarningFilesDestinationDirectory.getValue(),
                errorFilesDestinationDirectory: wErrorFilesDestinationDirectory.getValue() ? "Y" : "N",
                lineNumberFilesDestinationDirectory: wLineNumberFilesDestinationDirectory.getValue() ? "Y" : "N",
                warningFilesExtension: wWarningFilesExtension.getValue(),
                errorFilesExtension: wErrorFilesExtension.getValue(),
                lineNumberFilesExtension: wLineNumberFilesExtension.getValue(),

                filter: Ext.encode(filterStore.toJson()),
                fields: Ext.encode(fieldStore.toJson()),
                file: Ext.encode(fileNameStore.toJson())

            };
        };

        this.tabItems = [{
            xtype: 'KettleForm',
            title: '文件',
            autoScroll: true,
            bodyStyle: 'padding: 10px 0px',
            labelWidth: 170,
            items: [fileNamegrid,{
                xtype: 'fieldset',
                title: '从上一步骤获取文件',
                flex: 1,
                items: [wAcceptingFilenames,wPassingThruFields,wAcceptingField,wAcceptingStepName]
            }
            ]},{
            xtype: 'KettleForm',
            title: '内容',
            autoScroll: true,
            bodyStyle: 'padding: 10px 0px',
            labelWidth: 170,
            items: [wFileType, {
                xtype: 'compositefield',
                fieldLabel: '分割符',
                anchor: '-10',
                items: [wSeparator, {
                    xtype: 'button', text: '插入TAB', handler: function() {
                        wSeparator.setValue('\t' + wSeparator.getValue());
                    }
                }]
            },wEnclosure, wBreakInEnclosureAllowed, wEscapeCharacter,{
                xtype: 'compositefield',
                fieldLabel: '头部',
                anchor: '-10',
                flex: 1,
                items: [wHeader,{
                    layout: 'form',
                    flex: 1,
                    labelWidth: 70,
                    border:false,
                    items: [wNrHeaderLines]}]
            },{
                xtype: 'compositefield',
                fieldLabel: '尾部',
                anchor: '-10',
                items: [wFooter, {
                    layout: 'form',
                    flex: 1,
                    labelWidth: 70,
                    border:false,
                    items: [wNrFooterLines]}]
            },{
                xtype: 'compositefield',
                fieldLabel: '包装行',
                flex: 1,
                anchor: '-10',
                items: [wLineWrapped, {
                    layout: 'form',
                    flex: 1,
                    labelWidth: 100,
                    border:false,
                    items: [wNrWraps]}]
            }, {
                xtype: 'compositefield',
                fieldLabel: '分页布局（pointout）',
                anchor: '-10',
                flex: 1,
                items: [wLayoutPaged, {
                    layout: 'form',
                    flex: 1,
                    labelWidth: 80,
                    border:false,
                    items: [wNrLinesPerPage,wNrLinesDocHeader]}]
            },wFileCompression,wNoEmptyLines,{
                xtype: 'compositefield',
                fieldLabel: '在输出包括字段名',
                anchor: '-10',
                flex: 1,
                items: [wIncludeFilename,{
                    layout: 'form',
                    labelWidth:90,
                    flex: 1,
                    border:false,
                    items: [wFilenameField]} ]
            },{
                xtype: 'compositefield',
                fieldLabel: '输出包含行数',
                anchor: '-10',
                flex: 1,
                items: [wIncludeRowNumber,{
                    layout: 'form',
                    flex: 1,
                    labelWidth: 80,
                    border:false,
                    items: [wRowNumberField,wRowNumberByFile]} ]
            },wFileFormat,wEncoding,wRowLimit,wDateFormatLenient,wDateFormatLocale,{
                xtype: 'fieldset',
                title: '结果文件名',
                items: [wAddresult]
            }]
        }, {
            xtype: 'KettleForm',
            title: '错误处理',
            bodyStyle: 'padding: 10px 0px',
            labelWidth: 170,
            items: [wErrorIgnored,wErrorLineSkipped,wErrorCountField,wErrorFieldsField,
                wErrorTextField,
                {xtype: 'compositefield',
                    fieldLabel: '告警文件目录',
                    anchor: '-10',
                    flex: 1,
                    items: [wWarningFilesDestinationDirectory,{layout: 'form',
                        flex: 1,
                        labelWidth: 50,
                        border:false,
                        items: [wWarningFilesExtension]},wWarningFilesFindButton]
                },{xtype: 'compositefield',
                    fieldLabel: '错误文件目录',
                    anchor: '-10',
                    flex: 1,
                    items: [wErrorFilesDestinationDirectory, {layout: 'form',
                        flex: 1,
                        labelWidth: 50,
                        border:false,
                        items: [wErrorFilesExtension]},wErrorFilesFindButton]
                },{xtype: 'compositefield',
                    fieldLabel: '失败行数文件目录',
                    anchor: '-10',
                    flex: 1,
                    items: [wLineNumberFilesDestinationDirectory,
                        {layout: 'form',
                            flex: 1,
                            labelWidth: 50,
                            border:false,
                            items: [wLineNumberFilesExtension]},wLineNumberFindButton]
                }]},filterGrid,fieldsgrid];
        HadoopFileInput.superclass.initComponent.call(this);
    }
});

Ext.reg('HadoopFileInput', HadoopFileInput);