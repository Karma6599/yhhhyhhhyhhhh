// ==========================================================================
// src/utils/gradients.js  —  gradient theming
// LogicDataTables color gradients for Prism UI
// (decompiled from Prism Client v6.4.3 custom QuickJS bytecode)
// ==========================================================================

// ---- line 558 ----
function zalloc(n) {
    let p2;
    p2 = malloc2(n);
    if (p2.isNull()) {
        throw new Error((("gradients: malloc(" + n) + ") failed"));
    }
    _memset(p2, 0, n);
    return p2;
}

// ---- line 564 ----
function _warnOnce(msg) {
    if (_warned) {
        return;
    }
    _warned = true;
    try {
        console.log((("[gradients] " + msg) + " \u2014 falling back to plain text"));
        return;
    } catch (e) {
        return;
    }
}

// ---- line 572 ----
function _makeSafeColumn() {
    let col;
    col = zalloc(SIZE_CSVCOLUMN);
    col.add(OFF_COL_STR_DATA).writePointer(zalloc(CSV_STR_STRIDE));
    col.add(OFF_COL_INT_DATA).writePointer(zalloc(4));
    return col;
}

// ---- line 578 ----
function _buildCsvRow(scale, speed) {
    let row;
    let table;
    let rawValues;
    let cols;
    let safeCol;
    let slots;
    let maxIdx;
    let idx;
    idx = [base2.add(COL_IDX_INT_A).readS32(), base2.add(COL_IDX_INT_B).readS32(), base2.add(COL_IDX_STR_A).readS32(), base2.add(COL_IDX_STR_B).readS32()];
    maxIdx = -1;
    let i;
    i = 0;
    while ((i < idx.length)) {
        if ((idx[i] > maxIdx)) {
            maxIdx = idx[i];
        }
        i++;
    }
    if ((maxIdx > MAX_SANE_COL_INDEX)) {
        _warnOnce((("column index globals look uninitialised (max=" + maxIdx) + ")"));
        return null;
    }
    slots = (((maxIdx + 1) > 0) ? (maxIdx + 1) : 1);
    safeCol = _makeSafeColumn();
    cols = zalloc((slots * 8));
    let i;
    i = 0;
    while ((i < slots)) {
        cols.add((i * 8)).writePointer(safeCol);
        i++;
    }
    rawValues = [Math.floor((speed * 100)), Math.floor((scale * 100))];
    let k;
    k = 0;
    while ((k < rawValues.length)) {
        let col;
        if (!((idx[k] < 0))) {
            col = _makeSafeColumn();
            col.add(OFF_COL_INT_DATA).readPointer().writeS32(rawValues[k]);
            cols.add((idx[k] * 8)).writePointer(col);
        }
        k++;
    }
    table = zalloc(SIZE_CSVTABLE);
    table.add(OFF_TABLE_COLUMNS).writePointer(cols);
    row = zalloc(SIZE_CSVROW);
    row.add(OFF_ROW_TABLE).writePointer(table);
    row.add(OFF_ROW_INDEX).writeS32(0);
    return row;
}

// ---- line 609 ----
function createGradient(colors, scale, speed) {
    let speed;
    let scale;
    let colors;
    colors = colors;
    /* @13 ?? ('unknown', 'UN_0xf5', 13) */
    if (scale) {
        scale = 1;
    }
    scale = scale;
    /* @22 ?? ('unknown', 'UN_0xf5', 22) */
    if (speed) {
        speed = 0.3;
    }
    speed = speed;
    try {
        let gradient;
        let colorWrapper;
        let colorArray;
        let colorCount;
        let row;
        if ((!(colors) || !(colors.length))) {
            return null;
        }
        row = _buildCsvRow(scale, speed);
        if (!(row)) {
            return null;
        }
        colorCount = colors.length;
        colorArray = zalloc(((colorCount * 4) + 4));
        let i;
        i = 0;
        while ((i < colorCount)) {
            colorArray.add((i * 4)).writeU32((colors[i] >>> 0));
            i++;
        }
        colorWrapper = zalloc(16);
        colorWrapper.writePointer(colorArray);
        colorWrapper.add(8).writeS32(colorCount);
        colorWrapper.add(12).writeS32(colorCount);
        gradient = zalloc(SIZE_GRADIENT);
        try {
            gradient.writePointer(base2.add(GRAD_VTABLE_SLOT).readPointer().add(16));
        } catch (e) {
        }
        gradient.add(OFF_GRAD_CSVROW).writePointer(row);
        gradient.add(OFF_GRAD_COLORS).writePointer(colorWrapper);
        return gradient;
    } catch (e) {
        _warnOnce(("createGradient failed: " + e));
        return null;
    }
}

// ---- line 634 ----
function applyGradientOnly(textFieldPtr, gradientPtr) {
    let df;
    if ((!(textFieldPtr) || textFieldPtr.isNull())) {
        return null;
    }
    if ((!(gradientPtr) || gradientPtr.isNull())) {
        return null;
    }
    df = DecoratedTextField_getOrCreate(textFieldPtr);
    if ((!(df) || df.isNull())) {
        return null;
    }
    BlingTextField_setGradient(df, gradientPtr);
    BlingTextField_setBlingEnabled(df, 1, 0);
    TextField_setFlag8D(df, 0);
    return df;
}

// ---- line 644 ----
function applyGradient(textFieldPtr, colors, scale, speed) {
    let speed;
    let scale;
    let colors;
    let textFieldPtr;
    textFieldPtr = textFieldPtr;
    colors = colors;
    /* @18 ?? ('unknown', 'UN_0xf5', 18) */
    if (scale) {
        scale = 1;
    }
    scale = scale;
    /* @27 ?? ('unknown', 'UN_0xf5', 27) */
    if (speed) {
        speed = 0.3;
    }
    speed = speed;
    let gradientPtr;
    gradientPtr = createGradient(colors, scale, speed);
    if (!(gradientPtr)) {
        return null;
    }
    return applyGradientOnly(textFieldPtr, gradientPtr);
}

// --------------------------------------------------------------------------
// module body (src/utils/gradients.js)
// --------------------------------------------------------------------------
// ---- line 651 ----
function anon651() {
    init_node_globals();
    base2 = Process.findModuleByName("libg.so").base;
    malloc2 = new NativeFunction(Module.getExportByName("libc.so", "malloc"), "pointer", ["uint"]);
    _memset = new NativeFunction(Module.getExportByName("libc.so", "memset"), "pointer", ["pointer", "int", "uint"]);
    _StringCtor = new NativeFunction(base2.add(15293804), "pointer", ["pointer", "pointer"]);
    DecoratedTextField_setupDecoratedText = new NativeFunction(base2.add(6031464), "void", ["pointer", "pointer", "pointer"]);
    DecoratedTextField_getOrCreate = new NativeFunction(base2.add(6030324), "pointer", ["pointer"]);
    BlingTextField_setGradient = new NativeFunction(base2.add(5762056), "void", ["pointer", "pointer"]);
    BlingTextField_setBlingEnabled = new NativeFunction(base2.add(5764168), "void", ["pointer", "int", "int"]);
    TextField_setFlag8D = new NativeFunction(base2.add(13512824), "void", ["pointer", "int"]);
    LogicDataTables_getColorGradientByName = new NativeFunction(base2.add(11350672), "pointer", ["pointer", "int"]);
    MovieClip_getTextFieldByName = new NativeFunction(base2.add(13321444), "pointer", ["pointer", "pointer"]);
    OFF_GRAD_CSVROW = 8;
    OFF_GRAD_COLORS = 88;
    OFF_ROW_TABLE = 0;
    OFF_ROW_INDEX = 8;
    OFF_TABLE_COLUMNS = 56;
    OFF_COL_STR_DATA = 8;
    OFF_COL_INT_DATA = 24;
    CSV_STR_STRIDE = 16;
    SIZE_GRADIENT = 96;
    SIZE_CSVTABLE = 64;
    SIZE_CSVCOLUMN = 32;
    SIZE_CSVROW = 16;
    COL_IDX_INT_A = 19132948;
    COL_IDX_INT_B = 19132952;
    COL_IDX_STR_A = 19132956;
    COL_IDX_STR_B = 19132960;
    GRAD_VTABLE_SLOT = 19102440;
    MAX_SANE_COL_INDEX = 4095;
    _warned = false;
    return;
}
