let currentPageSize = 10;
let currentIndex = -1;
let currentProductListType = parseInt(document.getElementById("productListType").value);
let currentTableParams = {};

function getSearchParams() {
  var formData = layui.form.val('component-form-group');

  var searchList = [];

  // ASIN
  if (formData.asin != "") {
    searchList.push('{"field":"asin","val":"' + formData.asin + '","operator":"="}');
  }

  // 站点
  if (formData.station_id != "" && parseInt(formData.station_id) != 0) {
    searchList.push('{"field":"station_id","val":"' + formData.station_id + '","operator":"="}');
  }

  // 产品名称
  if (formData.product_name != "") {
    searchList.push('{"field":"product_name","val":"' + formData.product_name + '","operator":"LIKE"}');
  }
  
  // 状态
  if (formData.state != "") {
    searchList.push('{"field":"state","val":"' + formData.state + '","operator":"=","render":"tag"}');
  }

  // 创建时间
  if (formData.createtime_start != "" && formData.createtime_end != "") {
    searchList.push('{"field":"createtime","val":"' + formData.createtime_start + ',' + formData.createtime_end + '","operator":"RANGE","render":"datetime"}');
  }

  // 初审时间
  if (formData.first_time_start != "" && formData.first_time_end != "") {
    searchList.push('{"field":"first_time","val":"' + formData.first_time_start + ',' + formData.first_time_end + '","operator":"RANGE","render":"datetime"}');
  }

  // 二审时间
  if (formData.second_time_start != "" && formData.second_time_end != "") {
    searchList.push('{"field":"second_time","val":"' + formData.second_time_start + ',' + formData.second_time_end + '","operator":"RANGE","render":"datetime"}');
  }

  // 提交人
  if (formData.submit_user != 0) {
    searchList.push('{"field":"submit_user","val":"' + formData.submit_user + '","operator":"=","render":"tag"}');
  }

  // 提交团队
  if (formData.submit_team != 0) {
    searchList.push('{"field":"submit_team","val":"' + formData.submit_team + '","operator":"=","render":"tag"}');
  }
  
  // 审核员
  if (formData.allot_id != 0) {
    searchList.push('{"field":"allot_id","val":"' + formData.allot_id + '","operator":"=","render":"tag"}');
  }

  return searchList;
}

const defaultCols = [
  {type: 'checkbox'},
  {field:'id', title:'ID', width:90},//,  fixed: 'left'
  {field:'image_url_pic', title:'图片', width:120, templet:"#imgTpl"},
  {field:'image_url', title:'图片链接', width:120},
  {field:'asin', title:'ASIN', width:140,templet:'#asinTpl'},
  //{field:'category_rank', title:'类目排序', width:80},
  //{field:'category', title:'类目', width:120},
  {field:'product_name', title:'产品名称', width:200},
  {field:'station_name', title:'站点', width:90},
  {field:'brand', title:'品牌', width:120},
  {field:'weight', title:'重量(g)', width:80},
  {field:'rate', title:'汇率', width:70},
  {field:'purchase_price', title:'进价', width:70},
  {field:'sale_price', title:'售价', width:70},
  {field:'fba_price', title:'FBA费用', width:90},
  {field:'ratio', title:'比例', width:70},
  {field:'coefficient', title:'比例系数', width:70},
  {field:'purchase_url', title:'采购链接', width:300, templet:"#procureUlrTpl"},
  {field:'remark', title:'样品采购备注', width:120},
  {field:'state', title:'状态', width:120,templet:'#stateTpl'},
  {field:'reason', title:'原因', width:120},
  {field:'createtime', title:'创建时间', width:160,templet:'#createTimeTpl'},
  {field:'first_time', title:'初审时间', width:160,templet:'#firstTimeTpl'},
  {field:'second_time', title:'二审时间', width:160,templet:'#secondTimeTpl'},
  {field:'allot_info', title:'审核员', width:120, templet:"#allotInfoTpl"},
  {field:'submit_user_info', title:'提交人', width:120, templet:"#submitUserTpl"},
  {field:'submit_team_info', title:'提交团队', width:120, templet:"#submitTeamTpl"},
];

function getSavedCols() {
  const savedCols = localStorage.getItem('tableCols2');
  return savedCols ? JSON.parse(savedCols) : defaultCols;
}

function saveCols(cols) {
  localStorage.setItem('tableCols2', JSON.stringify(cols));
}

function reloadCurrentPage() {
  renderProductList(currentTableParams);
}

function renderProductList(params){
  currentTableParams = JSON.parse(JSON.stringify(params));;
  console.log('加载第'+params.page+"页",currentTableParams)
  var setter = layui.setter
  var table = layui.table
  var token = layui.data(setter.tableName)[setter.request.tokenName]; 
  var laypage = layui.laypage;

  currentPageSize = params.limit;

  getRequest("/product/index",params,(res) => {
    
    if (res.code != 1) {
      if (res.code == 302) {
        window.location.href = "/#/user/login"
      }
      layer.msg(res.msg || '数据获取失败', {
        offset: '15px'
        ,icon: 2
        ,time: 1000
      }, function(){ });
      return;
    }      

    var cloudData = res.data;

    table.render({
      elem: '#test-table-toolbar'
      // ,url:'./json/table/product.js'
      // ,toolbar: '#test-table-toolbar-toolbarDemo'
      ,data: cloudData.list
      ,title: '用户数据'
      // ,height: 620
      ,cellMinWidth: 60
      ,cellMinHeight: 100
      ,page: false
      ,limit: 10
      ,cols: [getSavedCols()],
      done: function (res, curr, count) {
        console.log(res, curr, count);
        // 表格渲染完成后添加滚动事件监听
        const tableContainer = document.querySelector('.layui-table-main');
        if (tableContainer) {
            tableContainer.addEventListener('wheel', (e) => {
                if (e.ctrlKey) {
                    // 阻止默认滚动行为
                    e.preventDefault();
                    // 实现左右滚动
                    tableContainer.scrollLeft += e.deltaY;
                } else {
                    // 不按住 Ctrl 键时，让浏览器默认处理上下滚动
                }
            });
        }
      }
    });



    laypage.render({
      elem: "table-pagebar",
      count: cloudData.total,
      curr: params.page,
      limit: params.limit,
      limits: [10,20,50,100, 200, 500],
      layout: ['count', 'prev', 'page', 'next', 'limit', 'refresh', 'skip'], // 功能布局
      jump: function(obj){
        console.log('当前在第'+ params.page + '页，目标是第'+obj.curr+'页')
        if (params.page == obj.curr && params.limit == obj.limit) {
          console.log('不加载')
          return;
        }
        console.log('开始加载')
        params.page = obj.curr;
        params.limit = obj.limit;

        params["search[]"] = [];
        var searchList = getSearchParams();
        if (searchList.length > 0) {
          params["search[]"] = searchList;
        }
        
        renderProductList(params);
      }
    });
  });
}

function openAmazonDetailPage(stationId,asin) {
  if (stationId == 13) { // 美国
    url = 'http://www.amazon.com/dp/' + asin;
  } else if (stationId == 12) { // 法国
    url = 'http://www.amazon.fr/dp/' + asin;
  } else if (stationId == 11) { // 澳大利亚
    url = 'http://www.amazon.com.au/dp/' + asin;
  } else if (stationId == 9) { // 日本
    url = 'http://www.amazon.co.jp/dp/' + asin;
  } else if (stationId == 8) { // 英国
    url = 'http://www.amazon.co.uk/dp/' + asin;
  } else if (stationId == 7) { // 加拿大
    url = 'http://www.amazon.ca/dp/' + asin;
  }
  window.open(url);
}

function batchReviewProduct(productList, layero){
  let successCount = 0;
  let failCount = 0;
  let totalCount = productList.length;
  let processedCount = 0;
  let stateValueError = 0;

  console.log("batch preciew:",productList,productList.length);

  // 添加进度显示区域
  if(!layero.find('#progress-info').length) {
    layero.find('.layui-layer-content').append(`
      <div id="progress-info" style="margin-top: 20px; padding: 10px;">
        <div class="progress-text" style="margin-bottom: 10px;">处理进度：0/${totalCount}</div>
        <div class="progress-bar" style="background: #e6e6e6; height: 20px; border-radius: 10px; overflow: hidden;">
          <div class="progress" style="width: 0%; height: 100%; background: #009688; transition: width 0.3s;"></div>
        </div>
        <div class="result-text" style="margin-top: 10px;">成功：0 失败：0</div>
      </div>
    `);
  }

  // 更新进度显示
  function updateProgress() {
    const percent = (processedCount / totalCount * 100).toFixed(1);
    layero.find('.progress-text').text(`处理进度：${processedCount}/${totalCount}`);
    layero.find('.progress').css('width', percent + '%');
    let desc = "" 
    if (processedCount === totalCount) {
      desc = "，所有数据都已处理完成。";
    }
    if (stateValueError > 0) {
        desc = desc + `${stateValueError}条数据状态错误，状态应填以下几种："待审核"、"初审通过"、"审核驳回"、"审核通过"、"待二审"、"异议二审"、"无效数据"。`;
    }
     layero.find('.result-text').text(`成功：${successCount} 失败：${failCount} ${desc}`);
  }

  // 循环处理每个产品
  productList.forEach(product => {
    // 检查状态值是否合法
  if (typeof product.state !== 'number' || product.state < -1 || product.state > 5) {
    const resultCell = layero.find(`tr[data-id="${product.id}"] .review-result`);
    resultCell.html('<span style="color: #FF5722;">状态错误</span>');
    processedCount++;
    failCount++;
    stateValueError++;
    updateProgress();
    console.log('状态不合法');

    // 检查是否所有请求都已处理完成
    if(processedCount === totalCount) {
      setTimeout(() => {
        if(successCount > 0) {
          reloadCurrentPage();
        }
      }, 500);
    }
    return;
  }
console.log('开始处理产品：', product.id,product.state);  
    postRequest("/product/audit",{
      id: product.id,
      state: product.state,
      reason: product.reason
    },(res) => {
      processedCount++;
      
      // 更新表格中的结果列
      const resultCell = layero.find(`tr[data-id="${product.id}"] .review-result`);
      if(res.code === 1) {
        successCount++;
        resultCell.html('<span style="color: #009688;">成功</span>');
      } else {
        failCount++;
        resultCell.html(`<span style="color: #FF5722;">失败: ${res.msg || '未知错误'}</span>`);
      }

      updateProgress();

      // 当所有请求都处理完成时 
      if(processedCount === totalCount) {
        setTimeout(() => {
          if(successCount > 0) {
            reloadCurrentPage();
          }
        }, 500);
      }
    });
  });
}

layui.use(['admin', 'table', 'form', 'laydate'], function(){
  var admin = layui.admin
  ,setter = layui.setter
  ,table = layui.table
  ,element = layui.element
  ,layer = layui.layer
  ,laydate = layui.laydate
  ,form = layui.form
  $ = layui.$;
  var currentEditProduct = null;


  
  
   $(document).on('mousemove', '.image-hover-wrapper', function(e) {
      var $hoverImage = $(this).find('.hover-image');
      var mouseX = e.pageX;
      var mouseY = e.pageY;
      var windowWidth = $(window).width();
      var windowHeight = $(window).height();
      var imageWidth = $hoverImage.width();
      var imageHeight = $hoverImage.height();
      
      // 根据鼠标位置调整大图显示位置
      var left = mouseX + 20;
      var top = mouseY + 20;
      
      // 确保大图不会超出窗口边界
      if (left + imageWidth > windowWidth) {
          left = mouseX - imageWidth - 20;
      }
      if (top + imageHeight > windowHeight) {
          top = mouseY - imageHeight - 20;
      }
      
      $hoverImage.css({
          left: left + 'px',
          top: top + 'px'
      });
  });
  

  $("#productEditView").hide();

  $("#hideFormButton").click(function(){
    $("#productTable").removeClass("table-90-width")
    $("#productEditView").hide();
    return false;
  });

  $("#batchReviewBtn").click(function(){
      // 获取表格中选中的行
      var checkStatus = table.checkStatus('test-table-toolbar');
      var data = checkStatus.data;
      console.log("已选中产品：",data);  

      if(data.length === 0) {
          layer.msg('请选择要审核的产品', {
              icon: 2,
              time: 2000
          });
          return false;
      }

      var content = `
        <form class="layui-form" style="padding: 20px;" lay-filter="batchReviewForm">
            <h3>已选中产品列表</h3>
            <div style="max-height: 150px; overflow-y: auto; margin: 10px 0;">
              <table class="layui-table" style="margin: 0;">
                <thead>
                  <tr>
                    <th>ASIN</th>
                    <th>名称</th>
                    <th>结果</th>
                  </tr>
                </thead>
                <tbody>
                  ${data.map(item => `
                    <tr data-id="${item.id}">
                      <td>${item.asin}</td>
                      <td>${item.product_name}</td>
                      <td class="review-result"></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            <div class="layui-form-item">
              <label class="layui-form-label" style="text-align:left;">状态: </label>
               <div class="layui-form-item radio-wrap">
                  <div><input type="radio" name="state" value="0" title="待审核"></div>
                  <div><input type="radio" name="state" value="1" title="初审通过"></div>
                  <div><input type="radio" name="state" value="2" title="审核驳回"></div>
                  <div><input type="radio" name="state" value="3" title="审核通过"></div>
                  <div><input type="radio" name="state" value="4" title="待二审"></div>
                  <div><input type="radio" name="state" value="5" title="异议二审"></div>
                  <div><input type="radio" name="state" value="-1" title="无效数据"></div>
              </div>

              <div class="layui-form-item" id="edit_reason_item">
                <label class="layui-form-label" style="text-align:left;">原因: </label>
                <div class="layui-input-inline long-width">
                  <textarea name="reason" placeholder="审核原因" class="layui-textarea short-height" id="edit_reason"></textarea>
                </div>
              </div>
            </div>
        </form>`;

      

      layer.open({
        type: 1,
        title: '批量审核',
        area: ['500px', '600px'],
        content: content,
        btn: ['确定', '关闭'],
        success: function(layero, index){
          form.render( null,'batchReviewForm');
        },
        yes: function(index, layero){
          var state = layero.find('input[name=state]:checked').val();
          var reason = layero.find('textarea[name=reason]').val();
          if(!state) {
            layer.msg('请选择审核状态', {
                icon: 2,
                time: 2000
            });
            return;
          }

          let products = data.map(item => ({
            id: item.id,
            state: parseInt(state),
            reason: reason
          }));
          
          // 开始批量处理
          batchReviewProduct(products, layero);
        }
      });

      return false;
  });

  $("#importBtn").click(function(){
    // 创建文件选择输入框
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.xlsx';
    
    fileInput.onchange = function(e) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, {type: 'array'});
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, {header: 1});
        
        // 获取表头并找到需要的列的索引
        const headers = jsonData[0];
        const columnIndexes = {
          id: headers.indexOf('ID'),
          asin: headers.indexOf('ASIN'),
          name: headers.indexOf('产品名称'),
          station: headers.indexOf('站点名称'),
          state: headers.indexOf('状态'),
          reason: headers.indexOf('审核反馈')
        };
        
        // 提取数据
        const products = [];
        for(let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if(row.length > 0) {
            // 状态值转换函数
            const convertState = (stateText) => {
              switch(stateText) {
                case '待审核': return 0;
                case '初审通过': return 1;
                case '审核驳回': return 2;
                case '审核通过': return 3;
                case '待二审': return 4;
                case '异议二审': return 5;
                case '无效数据': return -1;
                default: return -2; // 异常值
              };
            };

            products.push({
              id: row[columnIndexes.id],
              asin: row[columnIndexes.asin],
              product_name: row[columnIndexes.name],
              station_name: row[columnIndexes.station],
              state: convertState(row[columnIndexes.state]),
              state_text: row[columnIndexes.state],
              reason: row[columnIndexes.reason]
            });
          }
        }
        
        // 创建预览表格
        const content = `
          <div style="padding: 20px;">
            <h3>导入数据预览</h3>
            <div style="max-height: 250px; overflow-y: auto;">
              <table class="layui-table" style="margin: 0;">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>ASIN</th>
                    <th>产品名称</th>
                    <th>站点名称</th>
                    <th>状态</th>
                    <th>审核反馈</th>
                    <th>结果</th>
                  </tr>
                </thead>
                <tbody>
                  ${products.map(item => `
                    <tr data-id="${item.id}">
                      <td>${item.id}</td>
                      <td>${item.asin}</td>
                      <td>${item.product_name}</td>
                      <td>${item.station_name}</td>
                      <td>${item.state_text}(${item.state})</td>
                      <td>${item.reason || ''}</td>
                      <td class="review-result"></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `;
        
        // 显示预览弹窗
        layer.open({
          type: 1,
          title: 'Excel导入预览',
          area: ['800px', '550px'],
          content: content,
          btn: ['确定导入', '关闭'],
          yes: function(index, layero){
            // 开始批量处理
            batchReviewProduct(products, layero);
          }
        });
      };
      
      reader.readAsArrayBuffer(file);
    };
    
    fileInput.click();
    return false;
  });

  $("#assignAuditsBtn").click(function(){
    // 获取表格中选中的行
    var checkStatus = table.checkStatus('test-table-toolbar');
    var data = checkStatus.data;
    
    if(data.length === 0) {
        layer.msg('请选择要分配的产品', {
            icon: 2,
            time: 2000
        });
        return false;
    }

    // 创建弹出层的内容
    var content = `
        <form class="layui-form" style="padding: 20px;">
            <div class="layui-form-item">
                <label class="layui-form-label">选择审核员</label>
                <div class="layui-input-block">
                    <select name="auditor" lay-verify="required" lay-filter="auditorSelect" lay-search>
                        <option value="">请选择审核员</option>
                        ${serviceData.allotList.map(item => 
                            `<option value="${item.id}">${item.nickname}(${item.username})</option>`
                        ).join('')}
                    </select>
                </div>
            </div>
        </form>
    `;

    // 打开弹出层
    layer.open({
        type: 1,
        title: '分配审核员',
        area: ['500px', '500px'],
        content: content,
        btn: ['确定', '取消'],
        success: function(layero, index){
            // 重新渲染表单元素
            form.render('select');
            
            // 监听下拉框选择
            form.on('select(auditorSelect)', function(data){
                console.log('选择的审核员ID：', data.value);
            });
        },
        yes: function(index, layero){
            // 获取选择的审核员ID
            var auditorId = parseInt(layero.find('select[name=auditor]').val());
            
            if(!auditorId) {
                layer.msg('请选择审核员', {
                    icon: 2,
                    time: 2000
                });
                return;
            }

            // 这里处理分配审核员的逻辑
            var productIds = data.map(item => item.id);
            
            // 发送请求到服务器
            postRequest("/product/allot", {
              ids: productIds,
              allot_id: auditorId
            }, (res) => {
                layer.close(index);
                if(res.code === 1) {
                    layer.msg('分配成功', {
                        icon: 1,
                        time: 2000
                    });
                    reloadCurrentPage();
                } else {
                    layer.msg(res.msg || '分配失败', {
                        icon: 2,
                        time: 2000
                    });
                }
            });
        }
    });

    return false;
  });

  $("#exportBtn").click(function(){ 
     // 获取表单数据
     let params = {type: currentProductListType};
     let searchList = getSearchParams();
     if (searchList.length > 0) {
       params["search[]"] = searchList;
     } else {
       params["search[]"] = [];
     }

     getBlobRequest("/product/export", params, (response) => {
         try {
             // 检查response是否是对象格式
             if (response && response.blob) {
                 // 创建blob对象
                 const blob = new Blob([response.blob], {
                     type: response.type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                 });
                 
                 // 创建下载链接
                 const url = window.URL.createObjectURL(blob);
                 const link = document.createElement('a');
                 link.href = url;
                 link.download = response.filename || '产品数据.xlsx';
                 document.body.appendChild(link);
                 link.click();
                 document.body.removeChild(link);
                 window.URL.revokeObjectURL(url);
                 
                 layer.msg('导出成功', {
                     icon: 1,
                     time: 2000
                 });
             } else {
                 // 如果返回的是错误信息
                 layer.msg(response.msg || '导出失败：返回数据格式错误', {
                     icon: 2,
                     time: 2000
                 });
             }
         } catch(e) {
             console.error('导出失败:', e);
             layer.msg('导出失败: ' + e.message, {
                 icon: 2,
                 time: 2000
             });
         }
     });
     
     return false;
  });

  form.render(null, 'product-form');

  form.render(null, 'component-form-group');
  form.on('submit(search-submit)', function(obj){
    console.log("点击了查询：",obj);
    let params = {type: currentProductListType, page: 1, limit: currentPageSize};

    params["search[]"] = [];
    var searchList = getSearchParams();
    if (searchList.length > 0) {
      params["search[]"] = searchList;
    }
    
    renderProductList(params);
    return false;
  });

  form.on('submit(product-form)',function(obj){
    console.log("点击了保存：",obj);
    console.log("当前产品值：",currentEditProduct);
    let oldParams = currentEditProduct;
    let newParams = obj.field;

     let updatedFields = {};
     let hasUpdateInfo = false;
     let hasUpdateState = false;
     Object.keys(obj.field).forEach(key => {
       let newValue = newParams[key];
       let oldValue = oldParams[key];
 
       // 处理特定类型的转换
      //  if (key === 'category_rank') {
      //    newValue = parseInt(newValue, 10);
      //  }  
       if (key === 'weight') {
         newValue = parseFloat(newValue);
       }
 
       // 如果新旧值不同，则记录更改
       if (newValue !== oldValue) {
         updatedFields[key] = newValue;
         if (key != "state" && key != "reason") {
            hasUpdateInfo = true;
         }
         if (key == "state" || key == "reason") {
            hasUpdateState = true;
         }
       }
     });

     // 更新原始对象中的更改字段
     Object.assign(oldParams, updatedFields);
     currentEditProduct = oldParams;

    if (hasUpdateState) {
        console.log("状态改变了：",newParams.state);
        
        postRequest("/product/audit",{
            id: oldParams.id,
            state: newParams.state,
            reason: newParams.reason
        },(res) => {
            layer.msg("更新产品状态：" + (res.msg || '更新失败'), {
                offset: '15px'
                ,icon: res.code == 1?1:2
                ,time: 2000
            }, function(){});
             // 更高表格对于的数据
             if (res.code === 1) { 
                // 获取表格实例 
                // const table = layui.table; 
                // // 更新表格中对应行的数据 
                // const tableData = table.cache['test-table-toolbar']; 
                // const index = tableData.findIndex(item => item.id === oldParams.id); 
                // if (index !== -1) { 
                //     tableData[index] = oldParams; 
                //     table.reload('test-table-toolbar', { 
                //         data: tableData 
                //     }); 
                // } 
                reloadCurrentPage();
            } 
        });
    }
    
    if (hasUpdateInfo) {
        console.log("产品信息改变了：",updatedFields,oldParams);

        postRequest("/product/edit",oldParams,(res) => {
            layer.msg("更新产品信息：" + (res.msg || '更新失败'), {
                offset: '15px'
                ,icon: res.code == 1?1:2
                ,time: 2000
            }, function(){});
            // 更高表格对于的数据
            if (res.code === 1) { 
                // 获取表格实例 
                // const table = layui.table; 
                // // 更新表格中对应行的数据 
                // const tableData = table.cache['test-table-toolbar']; 
                // const index = tableData.findIndex(item => item.id === oldParams.id); 
                // if (index !== -1) { 
                //     tableData[index] = oldParams; 
                //     table.reload('test-table-toolbar', { 
                //         data: tableData 
                //     }); 
                // } 
                reloadCurrentPage();
            } 
        });
    }
    return false;
  });



  laydate.render({
    elem: '#LAY-component-form-group-date',
    type: 'date',
    trigger: 'click',
    range: false
  });

  laydate.render({
    elem: '#product-create-start-date',
    type: 'datetime'
  });
  laydate.render({
    elem: '#product-create-end-date',
    type: 'datetime'
  });
  laydate.render({
    elem: '#product-first-start-date',
    type: 'datetime'
  });
  laydate.render({
    elem: '#product-first-end-date',
    type: 'datetime'
  });
  laydate.render({
    elem: '#product-second-start-date',
    type: 'datetime'
  });
  laydate.render({
    elem: '#product-second-end-date',
    type: 'datetime'
  });

  console.log("初始化");
  renderProductList({type: currentProductListType, page: 1, limit: 10});

  if (serviceData.stationList && serviceData.stationList.length) {
    $("#site-select").append(new Option("全部",0));
    serviceData.stationList.forEach((station)=>{
      $("#site-select").append(new Option(station.title,station.id));
    });
    form.render("select");
  }

  if (serviceData.teamList && serviceData.teamList.length) {
    $("#submitTeam-select").append(new Option("全部",0));
    serviceData.teamList.forEach((team)=>{
      $("#submitTeam-select").append(new Option(team.name,team.id));
    });
    form.render("select");
  }

  if (serviceData.authList && serviceData.authList.length) {
    $("#submitAuth-select").append(new Option("全部",0));
    serviceData.authList.forEach((team)=>{
      $("#submitAuth-select").append(new Option(`${team.nickname}(${team.username})`,team.id));
    });
    form.render("select");
  }

  if (serviceData.allotList && serviceData.allotList.length) {
    $("#allot-select").append(new Option("全部",0));
    serviceData.allotList.forEach((team)=>{
      $("#allot-select").append(new Option(`${team.nickname}(${team.username})`,team.id));
    });
    form.render("select");
  }
  
  addListen((key, value) => {
      
  }) 

  
   
    // 监听键盘事件
    document.addEventListener('keydown', function(event) {
      if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        event.preventDefault();

        // 获取表格数据
        var data = table.cache['test-table-toolbar'];
        if (!data || data.length === 0) return;

        let lastIndex = currentIndex;
        // 计算新的索引
        if (event.key === 'ArrowUp') {
          currentIndex = Math.max(0, currentIndex - 1);
        } else if (event.key === 'ArrowDown') {
          currentIndex = Math.min(data.length - 1, currentIndex + 1);
        }

        console.log("键盘上下键触发: "+currentIndex);
        loadEditViewWithData(data[currentIndex]);

        // 滚动到选中的行
         // 获取表格容器
         var tableContainer = document.querySelector(`div[lay-id="test-table-toolbar"]`);
        if (!tableContainer) return;

        // 获取指定行的DOM元素
        var tr = tableContainer.querySelector(`tr[data-index="${currentIndex}"]`);
        if (tr) {
          tr.scrollIntoView({ behavior: 'smooth', block: 'center' });
          tr.classList.add("layui-table-click");
        }

        var lastTr = tableContainer.querySelector(`tr[data-index="${lastIndex}"]`);
        if (lastTr) {
          lastTr.classList.remove("layui-table-click");
        }
      }
    });

    table.on('row(test-table-toolbar)', function(obj){
      currentIndex = obj.tr.data('index');
      obj.tr.addClass('layui-table-click').siblings().removeClass('layui-table-click');
      
      var data = obj.data;
      console.log('点击了行：',obj);
      loadEditViewWithData(data);

    });

    function loadEditViewWithData(data){
      var newWidth = window.screen.width - 400;
      $("#productTable").addClass("table-90-width")
      $("#productEditView").show();
      
      $("#edit_station_name").val(data.station_name);
      $("#edit_asin").val(data.asin);
      $("#edit_product_name").val(data.product_name);
      $("#edit_brand").val(data.brand);
      // $("#edit_category").val(data.category);
      // $("#edit_category_rank").val(data.category_rank);
      $("#edit_weight").val(data.weight);
      $("#edit_rate").val(data.rate);
      $("#edit_purchase_price").val( data.purchase_price);
      $("#edit_sale_price").val(data.sale_price);
      $("#edit_fba_price").val(data.fba_price);
      $("#edit_ratio").val(data.ratio);
      $("#edit_coefficient").val(data.coefficient);
      $("#edit_image_url").val(data.image_url);
      $("#edit_purchase_url").val(data.purchase_url);
      $("#edit_remark").val(data.remark);
      $("#edit_submit_user_name").val(data.submit_user_name);
      $("#edit_submit_team_name").val(data.submit_team_name);
      $("#edit_image").attr('src',data.image_url);
      $("#edit_state_text").val(data.state_text);

      $("#edit_reason").val(data.reason);
      

      form.val('product-form', {"state": data.state});

      var userInfo = layui.data('layuiAdmin').userInfo;
      if (userInfo.group_arr.includes(4)) {
        $("#edit_reason").attr("disabled", true);
        $('input[type="radio"]').prop('disabled', true);
      } 
      
      currentEditProduct = data;
    }
  
  


  //头工具栏事件
  table.on('toolbar(test-table-toolbar)', function(obj){
    var checkStatus = table.checkStatus(obj.config.id);
    switch(obj.event){
      case 'getCheckData':
        var data = checkStatus.data;
        layer.alert(JSON.stringify(data));
      break;
      case 'getCheckLength':
        var data = checkStatus.data;
        layer.msg('选中了：'+ data.length + ' 行');
      break;
      case 'isAll':
        layer.msg(checkStatus.isAll ? '全选': '未全选');
      break;
    };
  });
  
  //监听行工具事?
  table.on('tool(test-table-toolbar)', function(obj){
    var data = obj.data;
    if(obj.event === 'del'){
      layer.confirm('真的删除行么', function(index){
        obj.del();
        layer.close(index);
      });
    } else if(obj.event === 'edit'){
      layer.prompt({
        formType: 2
        ,value: data.email
      }, function(value, index){
        obj.update({
          email: value
        });
        layer.close(index);
      });
    }
  });

  var stationList = [];

  // 添加新增按钮点击事件
  $("#addBtn").click(function(){
    // 获取当前用户信息
    var userInfo = layui.data('layuiAdmin').userInfo;
    console.log("当前用户信息：",userInfo);
    
    // 加载站点数据
    getRequest("/station/select", {
        isTree: true,
        page: 1,
        initKey: 'id',
        initValue: '',
        select: true,
        quick_search: ''
    }, function(res){
        if(res.code === 1){
          layer.open({
            type: 1,
            title: '新增产品',
            area: ['600px', '600px'],
            content: $('#productAddView').html(),
            success: function(layero, index){  // 在弹窗成功打开后执行

              $(layero).find('input[name="submit_user_name"]').val(userInfo.nickname);
              $(layero).find('input[name="submit_team_name"]').val(userInfo.team?userInfo.team.name:"");

                // 渲染下拉框数据
                let selectHtml = '<option value="">请选择站点</option>';
                res.data.list.forEach(item => {
                    selectHtml += `<option value="${item.id}">${item.title}</option>`;
                });
                $(layero).find('select[name=station_id]').html(selectHtml)
                    .attr('lay-filter', 'stationSelect');
                form.render('select');
                stationList = res.data.list;

                // 重新绑定ASIN输入框失焦事件
                $(layero).find('input[name="asin"]').on('blur', function(){
                    console.log("检查asin1：", $(this).val());
                    checkAsin(layero);
                });

                // 重新绑定ASIN检查按钮点击事件
                $(layero).find('#checkAsinBtn').on('click', function(){
                    console.log("检查asin：", $(layero).find('input[name="asin"]').val());
                    checkAsin(layero);
                });

                // 修改站点选择监听事件
                form.on('select(stationSelect)', function(data){
                  // 从 stationList 中查找选中的站点数据
                  let selectedStation = stationList.find(station => station.id == data.value);
                  if (selectedStation) {
                      // 使用就近查找的方式获取rate输入框
                      $(data.elem).closest('.layui-form').find('input[name="rate"]').val(selectedStation.rate);
                      checkAsin(layero);
                  }
                });

                 // 重新绑定比例和比例系数点击事件
                $(layero).find('input[name="ratio"], input[name="coefficient"]').on('click', function(){
                  calculateRatio(layero);
                });

                 // 重新渲染表单元素
                form.render(null, 'product-add-form');

                 // 重新绑定表单提交事件
                form.on('submit(product-add-form)', function(data){
                  // 阻止表单默认提交行为
                  data.form.preventDefault && data.form.preventDefault();

                  console.log("提交表单数据：", data.field);  // 添加日志
                  
                  // 获取当前用户信息
                  var userInfo = layui.data('layuiAdmin').userInfo;
                  
                  // 构建提交数据
                  var submitData = {
                      ...data.field,  // 使用手动收集的表单数据
                      category_rank: 0,
                      category: "null",
                      reason: "",
                      status: "1",
                      weigh: "0",
                      submit_user: userInfo.id,
                      submit_team: userInfo.team?userInfo.team.id:0,
                      state: "0"
                  };

                  postRequest('/product/add', submitData, function(res){
                      if(res.code === 1) {
                          layer.msg('添加成功', {icon: 1});
                          layer.close(index);

                          let params = {page: 1, limit: currentPageSize};
                          params["search[]"] = [];
                          var searchList = getSearchParams();
                          if (searchList.length > 0) {
                            params["search[]"] = searchList;
                          }

                          renderProductList(params);
                      } else {
                          layer.msg(res.msg || '添加失败', {icon: 2});
                      }
                  });

                  return false;
                });

            }
          });
        }
    });
    return false;
  });

  $("#delBtn").click(function(){
    // 获取表格中选中的行
    var checkStatus = table.checkStatus('test-table-toolbar');
    var data = checkStatus.data;
    
    if(data.length === 0) {
        layer.msg('请选择要删除的产品', {
            icon: 2,
            time: 2000
        });
        return false;
    }

    layer.confirm('确定要删除选中的 ' + data.length + ' 条数据吗？', function(index){
        // 获取选中行的ID数组
        var ids = data.map(item => item.id);
        
        // 发送删除请求
        delRequest("/product/del", {
            ids: ids
        }, (res) => {
            layer.close(index);
            if(res.code === 1) {
                layer.msg('删除成功', {
                    icon: 1,
                    time: 2000
                });

                let params = {page: 1, limit: currentPageSize};
                params["search[]"] = [];
                var searchList = getSearchParams();
                if (searchList.length > 0) {
                  params["search[]"] = searchList;
                }
                // 刷新表格
                renderProductList(params);
            } else {
                layer.msg(res.msg || '删除失败', {
                    icon: 2,
                    time: 2000
                });
            }
        });
    });

    return false;
  });

  // 修改检查ASIN的函数，接收弹窗DOM参数
  function checkAsin(layero) {
    var asin = $(layero).find('input[name="asin"]').val();
    var station_id = $(layero).find('select[name="station_id"]').val();
    // var category_rank = $(layero).find('input[name="category_rank"]').val();
    var brand = $(layero).find('input[name="brand"]').val();

    if(!asin || !station_id) {
        return;
    }

    postRequest('/product/checkAsin', {
        asin: asin,
        station_id: station_id,
        // category_rank: category_rank,
        brand: brand
    }, function(res){
        layer.msg(res.code === 1 ? "ASIN有效" : res.msg, {icon: res.code === 1 ? 1 : 2});
    });
  }

  // 计算比例和比例系数
  function calculateRatio(layero) {
    var requiredFields = {
        'station_id': '站点',
        'rate': '汇率',
        'weight': '重量',
        'sale_price': '售价',
        'purchase_price': '进价',
        'fba_price': 'FBA费用'
    };

    var data = {};
    var missingFields = [];

    for(var field in requiredFields) {
        var value = field === 'station_id' ? 
            $(layero).find(`select[name='${field}']`).val() : 
            $(layero).find(`input[name='${field}']`).val();
        
        if(!value) {
            missingFields.push(requiredFields[field]);
        }
        data[field] = value;
    }

    if(missingFields.length > 0) {
        layer.msg('请先填写：' + missingFields.join('、'), {icon: 2});
        return;
    }

    // 获取当前用户信息
    var userInfo = layui.data('layuiAdmin').userInfo;

    // 构建完整的请求参数
    var params = {
        ...data,
        // category_rank: $(layero).find('input[name="category_rank"]').val(),
        weight: $(layero).find('input[name="weight"]').val(),
        status: "1",
        weigh: "0",
        submit_user: userInfo.id,
        submit_team: userInfo.team_id,
        state: "0",
        asin: $(layero).find('input[name="asin"]').val(),
        brand: $(layero).find('input[name="brand"]').val(),
        // category: $(layero).find('input[name="category"]').val(),
        product_name: $(layero).find('input[name="product_name"]').val(),
        image_url: $(layero).find('input[name="image_url"]').val(),
        purchase_url: $(layero).find('input[name="purchase_url"]').val(),
        remark: $(layero).find('textarea[name="remark"]').val()
    };

    postRequest('/product/calculateRatio', params, function(res){
        if(res.code === 1) {
            $(layero).find('input[name="ratio"]').val(res.data.ratio);
            $(layero).find('input[name="coefficient"]').val(res.data.coefficient);
        } else {
            layer.msg(res.msg || '计算失败', {icon: 2});
        }
    });
  }

  // 点击设置按钮弹出层
  $("#configColsBtn").click(function() {
    const currentCols = getSavedCols();
    const colIds = defaultCols.map(col => col.field || col.type);
    const checkedIds = currentCols.map(col => col.field || col.type);

    let content = `
      <form class="layui-form" style="padding: 20px;">
        <div class="layui-form-item">
          <label class="layui-form-label">选择列</label>
          <div class="layui-input-block">
            <ul id="colList" class="layui-list">
              ${defaultCols.map(col => `
                <li>
                  <input type="checkbox" name="cols" value="${col.field || col.type}" title="${col.title || '复选框'}" ${checkedIds.includes(col.field || col.type) ? 'checked' : ''}>
                </li>
              `).join('')}
            </ul>
          </div>
        </div>
      </form>
    `;

    layer.open({
      type: 1,
      title: '设置表格列',
      area: ['400px', '600px'],
      content: content,
      btn: ['保存', '取消'],
      success: function() {
        layui.form.render('checkbox');
      },
      yes: function(index) {
        const checkedItems = $('input[name="cols"]:checked');
        const newCols = [];
        checkedItems.each(function() {
          const id = $(this).val();
          const col = defaultCols.find(c => (c.field || c.type) === id);
          if (col) {
            newCols.push(col);
          }
        });
        saveCols(newCols);
        layer.close(index);
        // 重新渲染表格
        const params = {type: currentProductListType, page: 1, limit: currentPageSize};
        params["search[]"] = [];
        var searchList = getSearchParams();
        if (searchList.length > 0) {
          params["search[]"] = searchList;
        }
        renderProductList(params);
      }
    });

    return false;
  });


    // 监听select中input的点击事件，清空内容
  $(document).on('click', '.layui-select-title input', function() {
    var $input = $(this);
    $input.val('').attr('placeholder', '请选择');
    console.log('已清空select input内容');
  });


});