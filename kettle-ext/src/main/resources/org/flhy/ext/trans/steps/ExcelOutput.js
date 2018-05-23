
ExcelOutputDialog=Ext.extend(KettleTabDialog,{
    width: 700,
    height: 550,
    title: 'Excel输出',
    initComponent: function() {
        var me = this, cell = getActiveGraph().getGraph().getSelectionCell();

        //tab-file
        var wFileName=new Ext.form.TextField({ fieldLabel: '文件名', anchor: '-10', value:cell.getAttribute('name')});
        var wCreateParFolder=new Ext.form.Checkbox({boxLabel:'是否创建父目录?',checked:cell.getAttribute('create_parent_folder')=="Y"});
        var wDoNotCreateNewFileInit=new Ext.form.Checkbox({boxLabel:'初始化化时不创建新文件?',checked:cell.getAttribute('do_not_open_newfile_init')=="Y"});
        var wExtension = new Ext.form.TextField({ fieldLabel: '扩展名', anchor: '-10', value:cell.getAttribute('extention')});
        var wSplit=new Ext.form.Checkbox({boxLabel:'文件名中是否包含步骤?',checked:cell.getAttribute('split')=="Y"});
        var wDateInFileName=new Ext.form.Checkbox({boxLabel:'文件名中是否包含日期?',checked:cell.getAttribute('add_date')=="Y"});
        var wTimeInFileName=new Ext.form.Checkbox({boxLabel:'文件名中是否包含时间?',checked:cell.getAttribute('add_time')=="Y"});
        var wSpecifyFormat=new Ext.form.Checkbox({boxLabel:'日期是否格式化?',checked:cell.getAttribute('SpecifyFormat')=="Y"});
        var wAddFileNameToResult=new Ext.form.Checkbox({boxLabel:'把文件名添加到结果中?',checked:cell.getAttribute('add_to_result_filenames')=="Y"});

        var formatProxy=new Ext.data.HttpProxy({url:"/ExcelOutput/formats.do"});
        var formatData=Ext.data.Record.create([
            {name:"formatName",type:"String",mapping:"formatName"}
        ]);
        var formatReader=new Ext.data.JsonReader({},formatData);
        var formatStore=new Ext.data.Store({
            proxy:formatProxy,
            reader:formatReader
        });
        var formatCombo=new Ext.form.ComboBox({
            fieldLabel: '时间格式',
            triggerAction:"all",
            store:formatStore,
            displayField:"formatName",
            valueField:"formatName",
            mode:"remote",
            disabled:true
        });


        //tab-content
        var wAppend=new Ext.form.Checkbox({boxLabel:'是否追加?',checked:cell.getAttribute('append')=="Y"});
        var wHeader=new Ext.form.Checkbox({boxLabel:'头部?',checked:cell.getAttribute('header')=="Y"});
        var wFooter=new Ext.form.Checkbox({boxLabel:'尾部?',checked:cell.getAttribute('footer')=="Y"});

        var encodingProxy=new Ext.data.HttpProxy({url:"/commonStep/Encodings.do"});
        var encodingData=Ext.data.Record.create([
            {name:"encodingName",type:"String",mapping:"encodingName"}
        ]);
        var encodingReader=new Ext.data.JsonReader({},encodingData);
        var encodingStore=new Ext.data.Store({
            proxy:encodingProxy,
            reader:encodingReader
        });
        var wEncodingCombo=new Ext.form.ComboBox({
            triggerAction:"all",
            store:encodingStore,
            displayField:"encodingName",
            valueField:"encodingName",
            mode:"remote",
            emptyText:"字符集选择"
        });
        var wSplitEvery = new Ext.form.TextField({ fieldLabel: 'wSplitEve', anchor: '-10', value:cell.getAttribute('splitevery')});
        var wSheetName = new Ext.form.TextField({ fieldLabel: '工作表名', anchor: '-10', value:cell.getAttribute('sheetname')});
        var wProtectSheet=new Ext.form.Checkbox({boxLabel:'工作表示是否加锁?',checked:cell.getAttribute('protect_sheet')=="Y"});
        var wPassword = new Ext.form.TextField({ fieldLabel: '密码',inputType:'password',anchor: '-10',disabled:true});
        var wAutoColumnSize=new Ext.form.Checkbox({boxLabel:'自适应列?',checked:cell.getAttribute('autosizecolums')=="Y"});
        var wRetainNullValues=new Ext.form.Checkbox({boxLabel:'保留空值?',checked:cell.getAttribute('nullisblank')=="Y"});
        var wUsetempfiles=new Ext.form.Checkbox({boxLabel:'使用临时文件?',checked:cell.getAttribute('usetempfiles')=="Y"});
        var wTempFileDir=new Ext.form.TextField({ fieldLabel: '路径',disabled:true,inputType:'file',anchor: '-10'/*,value:cell.getAttribute('tempdirectory')*/});
        //tab-content-template
        var wUsetemplatefiles=new Ext.form.Checkbox({boxLabel:'使用模板?',checked:cell.getAttribute('enabled')=="Y"});
        var wTemplateFile=new Ext.form.TextField({ fieldLabel: '选择模板',disabled:true,inputType:'file',anchor: '-10'/*,value:cell.getAttribute('filename')*/});
        var wAppendTemplate=new Ext.form.Checkbox({boxLabel:'追加模板?',disabled:true,checked:cell.getAttribute('append')=="Y"});


        //tab-Custom-HeaderFont
        //字体
        var fontDescProxy=new Ext.data.HttpProxy({url:"/ExcelOutput/fontnameDesc.do"});
        var fontDescData=Ext.data.Record.create([
            {name:"fontName",type:"String",mapping:"fontName"}
        ]);
        var fontDescReader=new Ext.data.JsonReader({},fontDescData);
        var fontDescStore=new Ext.data.Store({
            proxy:fontDescProxy,
            reader:fontDescReader
        });
        //颜色
        var fontColorProxy=new Ext.data.HttpProxy({url:"/ExcelOutput/fontColorCode.do"});
        var fontColorData=Ext.data.Record.create([
            {name:"fontColor",type:"String",mapping:"fontColor"}
        ]);
        var fontColorReader=new Ext.data.JsonReader({},fontColorData);
        var fontColorStore=new Ext.data.Store({
            proxy:fontColorProxy,
            reader:fontColorReader
        });
        var wHeaderFontName=new Ext.form.ComboBox({
            fieldLabel: '表头字体',
            triggerAction:"all",
            store:fontDescStore,
            displayField:"fontName",
            valueField:"fontName",
            mode:"remote"
        });

        wHeaderFontName.setValue( cell.getAttribute('header_font_name'));
        wHeaderFontName.setRawValue( cell.getAttribute('header_font_name'));
        var wHeaderFontSize=new Ext.form.TextField({ fieldLabel: '表头字体大小', anchor: '-10', value:cell.getAttribute('header_font_size')});
        var wHeaderFontBold=new Ext.form.Checkbox({boxLabel:'表头字体加粗?',checked:cell.getAttribute('header_font_bold')=="Y"});
        var wHeaderFontItalic=new Ext.form.Checkbox({boxLabel:'表头字体倾斜?',checked:cell.getAttribute('header_font_italic')=="Y"});
        var fontUnderlineProxy=new Ext.data.HttpProxy({url:"/ExcelOutput/fontUnderlineDesc.do"});
        var fontUnderlineData=Ext.data.Record.create([
            {name:"fontUnderline",type:"String",mapping:"fontUnderline"}
        ]);
        var fontUnderlineReader=new Ext.data.JsonReader({},fontUnderlineData);
        var fontUnderlineStore=new Ext.data.Store({
            proxy:fontUnderlineProxy,
            reader:fontUnderlineReader
        });
        var wFontUnderline=new Ext.form.ComboBox({
            fieldLabel: '表头下划线类型',
            triggerAction:"all",
            store:fontUnderlineStore,
            displayField:"fontUnderline",
            valueField:"fontUnderline",
            mode:"remote"
        });
        wFontUnderline.setValue( cell.getAttribute('header_font_underline'));
        wFontUnderline.setRawValue( cell.getAttribute('header_font_underline'));
        var fontOrientationProxy=new Ext.data.HttpProxy({url:"/ExcelOutput/fontOrientationCode.do"});
        var fontOrientationData=Ext.data.Record.create([
            {name:"fontOr",type:"String",mapping:"fontOr"}
        ]);
        var fontOrientationReader=new Ext.data.JsonReader({},fontOrientationData);
        var fontOrientationStore=new Ext.data.Store({
            proxy:fontOrientationProxy,
            reader:fontOrientationReader
        });
        var wFontOrientation=new Ext.form.ComboBox({
            fieldLabel: '字体位置',
            triggerAction:"all",
            store:fontOrientationStore,
            displayField:"fontOr",
            valueField:"fontOr",
            mode:"remote"
        });
        wFontOrientation.setValue( cell.getAttribute('header_font_orientation'));
        wFontOrientation.setRawValue( cell.getAttribute('header_font_orientation'));
        var wHeaderFontColor=new Ext.form.ComboBox({
            fieldLabel: '表头字体颜色',
            triggerAction:"all",
            store:fontColorStore,
            displayField:"fontColor",
            valueField:"fontColor",
            mode:"remote"
        });
        wHeaderFontColor.setValue( cell.getAttribute('header_font_color'));
        wHeaderFontColor.setRawValue( cell.getAttribute('header_font_color'));
        var wHeaderBackGroundColor=new Ext.form.ComboBox({
            fieldLabel: '表头背景颜色',
            triggerAction:"all",
            store:fontColorStore,
            displayField:"fontColor",
            valueField:"fontColor",
            mode:"remote"
        });
        wHeaderBackGroundColor.setValue( cell.getAttribute('header_background_color'));
        wHeaderBackGroundColor.setRawValue( cell.getAttribute('header_background_color'));
        var wHeaderHeight=new Ext.form.TextField({ fieldLabel: '高度', anchor: '-10', value:cell.getAttribute('header_row_height')});
        var headerAlignmentProxy=new Ext.data.HttpProxy({url:"/ExcelOutput/headerAlignmentCode.do"});
        var headerAlignmentData=Ext.data.Record.create([
            {name:"headerAlignment",type:"String",mapping:"headerAlignment"}
        ]);
        var headerAlignmentReader=new Ext.data.JsonReader({},headerAlignmentData);
        var headerAlignmentStore=new Ext.data.Store({
            proxy:headerAlignmentProxy,
            reader:headerAlignmentReader
        });
        var wHeaderAlignment=new Ext.form.ComboBox({
            fieldLabel: '字体位置',
            triggerAction:"all",
            store:headerAlignmentStore,
            displayField:"headerAlignment",
            valueField:"headerAlignment",
            mode:"remote"
        });
        wHeaderAlignment.setValue( cell.getAttribute('header_alignment'));
        wHeaderAlignment.setRawValue( cell.getAttribute('header_alignment'));
        var wImage=new Ext.form.TextField({ fieldLabel: '添加图片',inputType:'file',anchor: '-10'});

        //tab-Custom-RowFont
        var wRowFontName=new Ext.form.ComboBox({
            fieldLabel: '行字体',
            triggerAction:"all",
            store:fontDescStore,
            displayField:"fontName",
            valueField:"fontName",
            mode:"remote"
        });
        wRowFontName.setValue( cell.getAttribute('row_font_name'));
        wRowFontName.setRawValue( cell.getAttribute('row_font_name'));
        var wRowFontSize=new Ext.form.TextField({ fieldLabel: '行字体大小', anchor: '-10', value:cell.getAttribute('row_font_size')});
        var wRowFontColor=new Ext.form.ComboBox({
            fieldLabel: '行字体颜色',
            triggerAction:"all",
            store:fontColorStore,
            displayField:"fontColor",
            valueField:"fontColor",
            mode:"remote"
        });
        wRowFontColor.setValue( cell.getAttribute('row_font_color'));
        wRowFontColor.setRawValue( cell.getAttribute('row_font_color'));
        var wRowBackgroundColor=new Ext.form.ComboBox({
            fieldLabel: '行字体颜色',
            triggerAction:"all",
            store:fontColorStore,
            displayField:"fontColor",
            valueField:"fontColor",
            mode:"remote"
        });
        wRowBackgroundColor.setValue( cell.getAttribute('row_background_color'));
        wRowBackgroundColor.setRawValue( cell.getAttribute('row_background_color'));

        var columnTypeProxy=new Ext.data.HttpProxy({url:"/ExcelOutput/columnType.do"});
        var columnTypeData=Ext.data.Record.create([
            {name:"type",type:"String",mapping:"type"}
        ]);
        var columnTypeReader=new Ext.data.JsonReader({},columnTypeData);
        var columnTypeStore=new Ext.data.Store({
            proxy:columnTypeProxy,
            reader:columnTypeReader
        });
        var columnFormatsProxy=new Ext.data.HttpProxy({url:"/ExcelOutput/columnFormats.do"});
        var columnFormatsData=Ext.data.Record.create([
            {name:"format",type:"String",mapping:"format"}
        ]);
        var columnFormatsReader=new Ext.data.JsonReader({},columnFormatsData);
        var columnFormatsStore=new Ext.data.Store({
            proxy:columnFormatsProxy,
            reader:columnFormatsReader
        });


        wSpecifyFormat.on('check', function(cb, checked) {
            if(checked){
                formatCombo.enable();
                wDateInFileName.disable();
                wTimeInFileName.disable();
                wDateInFileName.setValue(false);
                wTimeInFileName.setValue(false);
            }else{
                formatCombo.disable();
                wDateInFileName.enable();
                wTimeInFileName.enable();
                formatCombo.setValue("");
                formatCombo.setRawValue("");
            }
        });
        wProtectSheet.on('check', function(cb, checked) {
            if(checked){
                wPassword.enable();
            }else{
                wPassword.disable();
            }
        });
        wUsetempfiles.on('check', function(cb, checked) {
            if(checked){
                wTempFileDir.enable();
            }else{
                wTempFileDir.disable();
            }
        });
        wUsetemplatefiles.on('check', function(cb, checked) {
            if(checked){
                wTemplateFile.enable();
                wAppendTemplate.enable();
            }else{
                wTemplateFile.disable();
                wAppendTemplate.disable();
            }
        });
        var fieldStore = new Ext.data.JsonStore({
            fields: ['name', 'type','format'],
            data: Ext.decode(cell.getAttribute('fields'))
        });

        this.tabItems = [
            {
                title: '文件',
                xtype: 'KettleForm',
                bodyStyle: 'padding: 10px 0px',
                items: [
                    {
                        xtype: 'compositefield',
                        fieldLabel: '文件名称',
                        anchor: '-10',
                        items: [wFileName, {
                            xtype: 'button', text: '浏览..', handler: function() {
                                var dialog = new FileExplorerWindow();
                                dialog.on('ok', function(path) {
                                    wFileName.setValue(path+"\\"+wFileName.getValue()+".xls");
                                    dialog.close();
                                });
                                dialog.show();
                            }
                        }]
                    },wCreateParFolder,wDoNotCreateNewFileInit,wExtension,wSplit,wDateInFileName,
                    wTimeInFileName,wSpecifyFormat,formatCombo,wAddFileNameToResult
                ]
            },
            {
                title: '内容',
                xtype: 'KettleForm',
                bodyStyle: 'padding: 10px 0px',
                items: [
                    wAppend,wHeader,wFooter,wEncodingCombo,wSplitEvery,wSheetName,wProtectSheet,wPassword,wAutoColumnSize,
                    wRetainNullValues,wUsetempfiles,wTempFileDir,wUsetemplatefiles,wTemplateFile,wAppendTemplate
                ]
            },{
                title: 'Custom',
                xtype: 'KettleForm',
                bodyStyle: 'padding: 10px 0px',
                items: [
                    wHeaderFontName,wHeaderFontSize,wHeaderFontBold,wHeaderFontItalic,wFontUnderline,wFontOrientation,
                    wHeaderFontColor,wHeaderBackGroundColor,wHeaderHeight,wHeaderAlignment,wImage,wRowFontName,
                    wRowFontSize,wRowFontColor,wRowBackgroundColor
                ]
            },{
                title: 'fields',
                xtype: 'editorgrid',
                columns: [new Ext.grid.RowNumberer(),{
                    header: '字段名', dataIndex: 'name', width: 200, editor: new Ext.form.ComboBox({
                        displayField: 'name',
                        valueField: 'name',
                        typeAhead: true,
                        forceSelection: true,
                        triggerAction: 'all',
                        selectOnFocus:true,
                        listeners : {
                            beforequery: function(qe){
                                delete qe.combo.lastQuery;
                            }
                        }
                    })
                },{
                    header: '类型', dataIndex: 'type', width: 200, editor: new Ext.form.ComboBox({
                        displayField: 'type',
                        valueField: 'type',
                        typeAhead: true,
                        forceSelection: true,
                        triggerAction: 'all',
                        selectOnFocus:true,
                        store: columnTypeStore,
                        mode:"remote"
                    })
                },{
                    header: '格式', dataIndex: 'format', width: 200, editor: new Ext.form.ComboBox({
                        displayField: 'format',
                        valueField: 'format',
                        typeAhead: true,
                        forceSelection: true,
                        triggerAction: 'all',
                        selectOnFocus:true,
                        store: columnFormatsStore,
                        mode:"remote"
                    })
                }],
                tbar: [
                    {
                        text: '新增字段', handler: function(btn) {
                        var grid = btn.findParentByType('editorgrid');
                        var RecordType = grid.getStore().recordType;
                        var rec = new RecordType({  type: '', format: '' });
                        grid.stopEditing();
                        grid.getStore().insert(0, rec);
                        grid.startEditing(0, 0);
                    }
                    },{
                        text: '删除字段', handler: function(btn) {
                            var sm = btn.findParentByType('editorgrid').getSelectionModel();
                            if(sm.hasSelection()) {
                                var row = sm.getSelectedCell()[0];
                                fieldStore.removeAt(row);
                            }
                        }
                    },{
                        text: '获取字段', handler: function() {
                            getActiveGraph().inputOutputFields(cell.getAttribute('label'), true, function(store) {
                                fieldStore.merge(store, [{name: 'name', field: 'name'}]);
                            });
                        }
                    }
                ],
                store: fieldStore
            }
        ];

        this.getValues = function(){
            return {

                name:wFileName.getValue(),
                create_parent_folder:wCreateParFolder.getValue()? "Y" : "N",
                do_not_open_newfile_init:wDoNotCreateNewFileInit.getValue()? "Y" : "N",
                extention:wExtension.getValue(),
                split:wSplit.getValue()? "Y" : "N",
                add_date:wDateInFileName.getValue()? "Y" : "N",
                add_time:wTimeInFileName.getValue()? "Y" : "N",
                SpecifyFormat:wSpecifyFormat.getValue()? "Y" : "N",
                add_to_result_filenames:wAddFileNameToResult.getValue()? "Y" : "N",
                date_time_format:formatCombo.getValue(),
                append:wAppend.getValue()? "Y" : "N",
                header:wHeader.getValue()? "Y" : "N",
                footer:wFooter.getValue()? "Y" : "N",
                encoding:wEncodingCombo.getValue(),
                splitevery:wSplitEvery.getValue(),
                sheetname:wSheetName.getValue(),
                protect_sheet:wProtectSheet.getValue()? "Y" : "N",
                password:wPassword.getValue(),
                autosizecolums:wAutoColumnSize.getValue()? "Y" : "N",
                nullisblank:wRetainNullValues.getValue()? "Y" : "N",
                usetempfiles:wUsetempfiles.getValue()? "Y" : "N",
                tempdirectory:wTempFileDir.getValue(),
                enabled:wUsetemplatefiles.getValue()? "Y" : "N",
                filename:wTemplateFile.getValue(),
                append:wAppendTemplate.getValue()? "Y" : "N",
                header_font_name:wHeaderFontName.getValue(),
                header_font_size:wHeaderFontSize.getValue(),
                header_font_bold:wHeaderFontBold.getValue()? "Y" : "N",
                header_font_italic:wHeaderFontItalic.getValue()? "Y" : "N",
                header_font_underline:wFontUnderline.getValue(),
                header_font_orientation:wFontOrientation.getValue(),
                header_font_color:wHeaderFontColor.getValue(),
                header_background_color:wHeaderBackGroundColor.getValue(),
                header_row_height:wHeaderHeight.getValue(),
                header_alignment:wHeaderAlignment.getValue(),
                header_image:wImage.getValue(),
                row_font_name:wRowFontName.getValue(),
                row_font_size:wRowFontSize.getValue(),
                row_font_color:wRowFontColor.getValue(),
                row_background_color:wRowBackgroundColor.getValue(),
                fields: Ext.encode(fieldStore.toJson())
            };
        };
        ExcelOutputDialog.superclass.initComponent.call(this);
    }
})

Ext.reg('ExcelOutput', ExcelOutputDialog);