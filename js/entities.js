class Feature {
  /**
   * @param {number} fid
   * @param {string} geom
   * @param {string} name
   */
  constructor(fid, geom, name) {
    this.fid = fid;
    this.geom = geom;
    this.name = name;
  }
}

class EmdBoundary extends Feature {
  /**
   * @param {number} fid
   * @param geom
   * @param {string} ufid
   * @param {string} bjcd
   * @param {string} name
   * @param {string} divi
   * @param {string} scls
   * @param {string} fmta
   */
  constructor(fid, geom, ufid, bjcd, name, divi, scls, fmta) {
    super(fid, geom, name);
    this.ufid = ufid;
    this.bjcd = bjcd;
    this.divi = divi;
    this.scls = scls;
    this.fmta = fmta;
  }
}

class SubwayStation extends Feature {
  /**
   *
   * @param {number} fid
   * @param geom
   * @param {string} name
   * @param {string} lineNumber
   * @param {string} colour
   */
  constructor(fid, geom, name, lineNumber, colour) {
    super(fid, geom, name);
    this.lineNumber = lineNumber;
    this.colour = colour;
  }
}

class SubwayLines extends Feature {
  /**
   * @param {number} fid
   * @param geom
   * @param {string} name
   * @param {string} nameEn
   * @param {string} operator
   * @param {string} operatorEn
   * @param {string} colour
   */
  constructor(fid, geom, name, nameEn, operator, operatorEn, colour) {
    super(fid, geom, name);
    this.nameEn = nameEn;
    this.operator = operator;
    this.operatorEn = operatorEn;
    this.colour = colour;
  }
}
