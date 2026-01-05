const lcjs = require('@lightningchart/lcjs')
const { lightningChart, PointSeriesTypes3D, PointStyle3D, ColorRGBA, SolidFill, SolidLine, IndividualPointFill, htmlTextRenderer, PointShape, emptyLine, } = lcjs

let isSettingLineValue = false
let allLidarData = []
let totalPointsCount = 0
const TOLERANCE = 50  
const MAX_POINTS = 50_000
let bounds = null
// Initial location selection
let xPoint = 4236
let yPoint = 2040
let zPoint = -2251

const exampleContainer = document.getElementById('chart') || document.body
if (exampleContainer === document.body) {
  exampleContainer.style.width = '100vw'
  exampleContainer.style.height = '100vh'
  exampleContainer.style.margin = '0px'
}
const lc = lightningChart({
            resourcesBaseUrl: new URL(document.head.baseURI).origin + new URL(document.head.baseURI).pathname + 'resources/',
        })

// Create 3D Chart
const containerChart2 = document.createElement('div')
exampleContainer.append(containerChart2)
const chart3D = lc
  .Chart3D({
      container: containerChart2,
      legend: {
        visible: false,
      },
      textRenderer: htmlTextRenderer,
      theme: Themes[new URLSearchParams(window.location.search).get('theme') || 'darkGold'] || undefined,
  })
  .setTitle('3D view — select a point to update 2D slices')
  .setTitleMargin(0)
  .setBoundingBox({ x: 100, y: 60, z: 100 })
  .setCursorMode(undefined)
containerChart2.style.position = 'absolute'
containerChart2.style.right = '0px'
containerChart2.style.top = '0px'
containerChart2.style.width = '50%'
containerChart2.style.height = '50%'
chart3D.getDefaultAxisX().setTitle('Width (X)')
chart3D.getDefaultAxisY().setTitle('Height (Y)')
chart3D.getDefaultAxisZ().setTitle('Depth (Z)')
chart3D.setCursorDynamicBehavior({
  pointMarkerStroke: () => new SolidLine({ thickness: 2, fillStyle: new SolidFill({ color: ColorRGBA(255, 0, 0), }), }),
})

// Create 3 series for the 3D crosshair lines
const xLine = chart3D.addLineSeries()
  .setCursorEnabled(false)
  .setStrokeStyle(new SolidLine({ thickness: 4, fillStyle: new SolidFill({ color: ColorRGBA(255, 0, 0) }) }))
const yLine = chart3D.addLineSeries()
  .setCursorEnabled(false)
  .setStrokeStyle(new SolidLine({ thickness: 4, fillStyle: new SolidFill({ color: ColorRGBA(255, 0, 0) }) }))

const zLine = chart3D.addLineSeries()
  .setCursorEnabled(false)
  .setStrokeStyle(new SolidLine({ thickness: 4, fillStyle: new SolidFill({ color: ColorRGBA(255, 0, 0) }) }))

// Create XY Chart for Width-Depth
const containerChart1 = document.createElement('div')
exampleContainer.append(containerChart1)
const chartWD = lc
  .ChartXY({
    container: containerChart1,
    defaultAxisY: { type: 'linear-highPrecision' },
    legend: {
      visible: false
    },
    textRenderer: htmlTextRenderer,
    theme: Themes[new URLSearchParams(window.location.search).get('theme') || 'darkGold'] || undefined,,
  })
  .setTitle('Width vs Depth')
  .setUserInteractions(undefined)
  .setCursorMode(undefined)
containerChart1.style.position = 'absolute'
containerChart1.style.left = '0px'
containerChart1.style.top = '0px'
containerChart1.style.width = '50%'
containerChart1.style.height = '50%'
const xAxisWD = chartWD.getDefaultAxisX()
  .setTitle('Width (X)')
const yAxisWD = chartWD.getDefaultAxisY()
  .setTitle('Depth (Z)')
const seriesWD = chartWD.addPointSeries({
    schema: {
      x: { pattern: null},
      y: { pattern: null},
      color: { pattern: null},    
    }
  })
  .setPointStrokeStyle(emptyLine)
  .setPointFillStyle(new IndividualPointFill())
  .setPointShape(PointShape.Triangle)
  .setPointSize(3)
  .setMaxSampleCount(MAX_POINTS)

// Create XY Chart for Width-Height
const containerChart3 = document.createElement('div')
exampleContainer.append(containerChart3)
const chartWH = lc
  .ChartXY({
    container: containerChart3,
    defaultAxisY: { type: 'linear-highPrecision' },
    legend: {
      visible: false
    },
    textRenderer: htmlTextRenderer,
    // theme: Themes.darkGold,
  })
  .setTitle('Width vs Height')
  .setUserInteractions(undefined)
  .setCursorMode(undefined)
containerChart3.style.position = 'absolute'
containerChart3.style.left = '0px'
containerChart3.style.top = '50%'
containerChart3.style.width = '50%'
containerChart3.style.height = '50%'
const xAxisWH = chartWH.getDefaultAxisX()
  .setTitle('Width (X)')
const yAxisWH = chartWH.getDefaultAxisY()
  .setTitle('Height (Y)')
const seriesWH = chartWH.addPointSeries({
    schema: {
      x: { pattern: null},
      y: { pattern: null},
      color: { pattern: null},    
    }
  })
  .setPointStrokeStyle(emptyLine)
  .setPointFillStyle(new IndividualPointFill())
  .setPointShape(PointShape.Triangle)
  .setPointSize(3)
  .setMaxSampleCount(MAX_POINTS)

// Create XY Chart for Depth-Height
const containerChart4 = document.createElement('div')
exampleContainer.append(containerChart4)
const chartDH = lc
  .ChartXY({
    container: containerChart4,
    defaultAxisY: { type: 'linear-highPrecision' },
    legend: {
      visible: false
    },
    textRenderer: htmlTextRenderer,
    // theme: Themes.darkGold,
  })
  .setTitle('Depth vs Height')
  .setUserInteractions(undefined)
  .setCursorMode(undefined)
containerChart4.style.position = 'absolute'
containerChart4.style.right = '0px'
containerChart4.style.top = '50%'
containerChart4.style.width = '50%'
containerChart4.style.height = '50%'
const xAxisDH = chartDH.getDefaultAxisX()
  .setTitle('Depth (Z)')
const yAxisDH = chartDH.getDefaultAxisY()
  .setTitle('Height (Y)')
const seriesDH = chartDH.addPointSeries({
    schema: {
      x: { pattern: null},
      y: { pattern: null},
      color: { pattern: null},    
    }
  })
  .setPointStrokeStyle(emptyLine)
  .setPointFillStyle(new IndividualPointFill())
  .setPointShape(PointShape.Triangle)
  .setPointSize(3)
  .setMaxSampleCount(MAX_POINTS)

// Add draggable lines to XY Charts
const lineStyle = new SolidLine({ thickness: 2, fillStyle: new SolidFill({ color: ColorRGBA(255, 0, 0) }) })
const xAxisWDLine = xAxisWD.addConstantLine({legend: { visible: true }}).setStrokeStyle(lineStyle)
xAxisWDLine.addEventListener('valuechange', (event) => {
  lineValueChanged('xAxisWDLine', event.value)
})
const yAxisWDLine = yAxisWD.addConstantLine({legend: { visible: true, onTop: false }}).setStrokeStyle(lineStyle)
yAxisWDLine.addEventListener('valuechange', (event) => {
  lineValueChanged('yAxisWDLine', event.value)
})
const xAxisWHLine = xAxisWH.addConstantLine({legend: { visible: true }}).setStrokeStyle(lineStyle)
xAxisWHLine.addEventListener('valuechange', (event) => {
  lineValueChanged('xAxisWHLine', event.value)  
})
const yAxisWHLine = yAxisWH.addConstantLine({legend: { visible: true, onTop: false }}).setStrokeStyle(lineStyle)
yAxisWHLine.addEventListener('valuechange', (event) => {
  lineValueChanged('yAxisWHLine', event.value)  
})
const xAxisDHLine = xAxisDH.addConstantLine({legend: { visible: true }}).setStrokeStyle(lineStyle)
xAxisDHLine.addEventListener('valuechange', (event) => {
  lineValueChanged('xAxisDHLine', event.value)  
})
const yAxisDHLine = yAxisDH.addConstantLine({legend: { visible: true, onTop: false }}).setStrokeStyle(lineStyle)
yAxisDHLine.addEventListener('valuechange', (event) => {
  lineValueChanged('yAxisDHLine', event.value) 
})

// Load 3D image
const loadBinaryLidarFile = async (assetName, isColored) => {
  // Load LiDAR data as custom formatted binary file (contains total number of data points + each point X, Y, Z, R, G, B values)
  const result = await fetch(
    new URL(document.head.baseURI).origin + new URL(document.head.baseURI).pathname + `examples/assets/1710/${assetName}`,
  )
  const blob = await result.blob()
  const arrayBuffer = await blob.arrayBuffer()
  // Read number of points as first Uint32 value
  let arrayBufferBytePos = 0
  const pointsCount = new Uint32Array(arrayBuffer.slice(arrayBufferBytePos, arrayBufferBytePos + 4))[0]
  arrayBufferBytePos += 4
  // Read binary data into XYZRGB points
  const dataPoints = new Array(pointsCount).fill(0).map((_) => ({}))
  // X values in order
  const xValuesByteLength = pointsCount * 2
  const xValues = new Int16Array(arrayBuffer.slice(arrayBufferBytePos, arrayBufferBytePos + xValuesByteLength))
  arrayBufferBytePos += xValuesByteLength
  xValues.forEach((x, i) => (dataPoints[i].x = x))
  // Y values in order
  const yValuesByteLength = pointsCount * 2
  const yValues = new Int16Array(arrayBuffer.slice(arrayBufferBytePos, arrayBufferBytePos + yValuesByteLength))
  arrayBufferBytePos += yValuesByteLength
  yValues.forEach((y, i) => (dataPoints[i].y = y))
  // Z values in order
  const zValuesByteLength = pointsCount * 2
  const zValues = new Int16Array(arrayBuffer.slice(arrayBufferBytePos, arrayBufferBytePos + zValuesByteLength))
  arrayBufferBytePos += zValuesByteLength
  zValues.forEach((z, i) => (dataPoints[i].z = z))

  if (isColored) {
    // R values in order
    const rValuesByteLength = pointsCount * 1
    const rValues = new Uint8Array(arrayBuffer.slice(arrayBufferBytePos, arrayBufferBytePos + rValuesByteLength))
    arrayBufferBytePos += rValuesByteLength
    // G values in order
    const gValuesByteLength = pointsCount * 1
    const gValues = new Uint8Array(arrayBuffer.slice(arrayBufferBytePos, arrayBufferBytePos + rValuesByteLength))
    arrayBufferBytePos += gValuesByteLength
    // B values in order
    const bValuesByteLength = pointsCount * 1
    const bValues = new Uint8Array(arrayBuffer.slice(arrayBufferBytePos, arrayBufferBytePos + rValuesByteLength))
    arrayBufferBytePos += bValuesByteLength

    rValues.forEach((r, i) => {
      dataPoints[i].color = ColorRGBA(r, gValues[i], bValues[i])
    })
  } else {
    const buildingGrey = ColorRGBA(220, 220, 220)
    dataPoints.forEach(point => {
      point.color = buildingGrey
    })
  }

  // Add Point Series with lidar point cloud data
  const series3D = chart3D
    .addPointSeries({
      type: PointSeriesTypes3D.Pixelated,
      individualPointColorEnabled: true,
    })
    .add(dataPoints)

  switch (assetName) {
    case 'buildings.bin':
      series3D.setName('Buildings').setPointStyle( new PointStyle3D.Pixelated({ size: 1, fillStyle: new SolidFill({ color: ColorRGBA(220, 220, 220) }), }), )
      break;
    case 'green.bin':
      series3D.setName('Vegetation').setPointStyle( new PointStyle3D.Pixelated({ size: 1, fillStyle: new IndividualPointFill(), }), )
      chart3D.legend.setEntryOptions(series3D, {markerFillStyle: new SolidFill({ color: ColorRGBA(0, 64, 0)})})  
      break;
  }
  totalPointsCount += pointsCount

  if (!bounds && dataPoints.length > 0) {
    const p = dataPoints[0]
    bounds = {
      minX: p.x, maxX: p.x,
      minY: p.y, maxY: p.y,
      minZ: p.z, maxZ: p.z,
    }
  }

  for (let i = 0; i < dataPoints.length; i++) {
    const p = dataPoints[i]

    if (p.x < bounds.minX) bounds.minX = p.x
    if (p.x > bounds.maxX) bounds.maxX = p.x
    if (p.y < bounds.minY) bounds.minY = p.y
    if (p.y > bounds.maxY) bounds.maxY = p.y
    if (p.z < bounds.minZ) bounds.minZ = p.z
    if (p.z > bounds.maxZ) bounds.maxZ = p.z
  }

  return {
    series3D: series3D,
    dataPoints: dataPoints
  };
}

// Add calculated bounds to chart axis intervals
const applyAxisIntervalsFromBounds = () => {
  const pad = 0.0

  const padRange = (min, max) => {
    const r = max - min || 1
    const p = r * pad
    return { start: min - p, end: max + p }
  }

  const ix = padRange(bounds.minX, bounds.maxX)
  const iy = padRange(bounds.minY, bounds.maxY)
  const iz = padRange(bounds.minZ, bounds.maxZ)

  xAxisWD.setInterval(ix)
  yAxisWD.setInterval(iz)
  xAxisWH.setInterval(ix)
  yAxisWH.setInterval(iy)
  xAxisDH.setInterval(iz)
  yAxisDH.setInterval(iy)
}

Promise.all([ loadBinaryLidarFile('buildings.bin', false), loadBinaryLidarFile('green.bin', true), ])
.then((results) => {
  results.forEach(r => {
    const dataPoints = r.dataPoints
    for (let i = 0; i < dataPoints.length; i++) 
      allLidarData.push(dataPoints[i])

    applyAxisIntervalsFromBounds()
    // Set initial location
    update3DCrosshair()
    chartPointClicked()

    r.series3D.addEventListener('click', (event, info) => {
      xPoint = info.x
      yPoint = info.y
      zPoint = info.z

      update3DCrosshair()
      chartPointClicked()
    })
  })
})
.catch(error => {
  console.error("An error occurred during file loading:", error)
})

// Update 2D slice charts when the 3D selection changes
const chartPointClicked = () => {
  xAxisWDLine.setValue(xPoint)
  yAxisWDLine.setValue(zPoint)
  xAxisWHLine.setValue(xPoint)
  yAxisWHLine.setValue(yPoint)
  xAxisDHLine.setValue(zPoint)
  yAxisDHLine.setValue(yPoint)

  updateCharts('x', xPoint)
  updateCharts('y', yPoint)
  updateCharts('z', zPoint)
}

const updateCharts = (axis, value) => {
  const sliceData = extract2dSlice(axis, value)   

  switch(axis) {
    case 'x':
      seriesDH.clear()  
      seriesDH.appendJSON(sliceData)
      chartDH.setTitle('Depth vs Height — X slice at ' + value.toFixed(0))
      break;
    case 'y':
      seriesWD.clear()  
      seriesWD.appendJSON(sliceData)
      chartWD.setTitle('Width vs Depth — Y slice at ' + value.toFixed(0))
      break;
    case 'z':
      seriesWH.clear()  
      seriesWH.appendJSON(sliceData)
      chartWH.setTitle('Width vs Height — Z slice at ' + value.toFixed(0))    
      break; 
  }
}

// Extract a 2D slice from the 3D point cloud around the selected axis value
const extract2dSlice = (sliceAxis, sliceValue) => {
  let chartXAxis
  let chartYAxis

  if (sliceAxis === 'x') {
      chartXAxis = 'z';
      chartYAxis = 'y';
  } else if (sliceAxis === 'y') {
      chartXAxis = 'x';
      chartYAxis = 'z';
  } else { // sliceAxis === 'z'
      chartXAxis = 'x';
      chartYAxis = 'y';
  }

  const lowerBound = sliceValue - TOLERANCE;
  const upperBound = sliceValue + TOLERANCE;
  const slicedData = []
  
  for (let i = 0; i < allLidarData.length; i++) {
    const point = allLidarData[i]
    const val = point[sliceAxis]
    if (val >= lowerBound && val <= upperBound) {
      slicedData.push({ x: point[chartXAxis], y: point[chartYAxis], color: point.color })
      if (slicedData.length >= MAX_POINTS) break
    }
  }

  return slicedData;
}

// Synchronize selection when a draggable slice line is moved in a 2D chart
const lineValueChanged = (lineName, value) => {
  if (isSettingLineValue) {
    return;
  }
  isSettingLineValue = true
  let axisToUpdate = ''

  switch(lineName) {
    case 'xAxisWDLine':
    case 'xAxisWHLine':  
      xPoint = value
      xAxisWDLine.setValue(value)
      xAxisWHLine.setValue(value)
      axisToUpdate = 'x'
      break;
    case 'yAxisWHLine':
    case 'yAxisDHLine':    
      yPoint = value
      yAxisWHLine.setValue(value)
      yAxisDHLine.setValue(value)
      axisToUpdate = 'y'
      break;
    case 'yAxisWDLine':
    case 'xAxisDHLine':  
      zPoint = value
      yAxisWDLine.setValue(value)
      xAxisDHLine.setValue(value)
      axisToUpdate = 'z'
      break;
  }

  if (axisToUpdate) {
    update3DCrosshair()

    requestAnimationFrame(() => {
      updateCharts(axisToUpdate, value)
      isSettingLineValue = false
    });
  } else {
    isSettingLineValue = false
  }
}  

// Update the 3D crosshair to match the current slice position
const update3DCrosshair = () => {
  xLine.clear()
  yLine.clear()
  zLine.clear()
  xLine.add([{ x: bounds.minX, y: yPoint, z: zPoint }, { x: bounds.maxX, y: yPoint, z: zPoint }])
  yLine.add([{ x: xPoint, y: bounds.minY, z: zPoint }, { x: xPoint, y: bounds.maxY, z: zPoint }])
  zLine.add([{ x: xPoint, y: yPoint, z: bounds.minZ }, { x: xPoint, y: yPoint, z: bounds.maxZ }])
}