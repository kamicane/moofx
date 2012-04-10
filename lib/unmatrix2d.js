/*
Unmatrix 2d
 - a crude implementation of the slightly bugged pseudo code in http://www.w3.org/TR/css3-2d-transforms/#matrix-decomposition
*/"use strict"

// returns the length of the passed vector

var length = function(a){
    return Math.sqrt(a[0] * a[0] + a[1] * a[1])
}

// normalizes the length of the passed point to 1

var normalize = function(a){
    var l = length(a)
    return l ? [a[0] / l, a[1] / l] : [0, 0]
}

// returns the dot product of the passed points

var dot = function(a, b){
    return a[0] * b[0] + a[1] * b[1]
}

// returns the principal value of the arc tangent of
// y/x, using the signs of both arguments to determine
// the quadrant of the return value

var atan2 = Math.atan2

var combine = function(a, b, ascl, bscl){
    return [
        (ascl * a[0]) + (bscl * b[0]),
        (ascl * a[1]) + (bscl * b[1])
    ]
}

module.exports = function(a, b, c, d, tx, ty){

    // Make sure the matrix is invertible

    if ((a * d - b * c) === 0) return false

    // Take care of translation

    var translate = [tx, ty]

    // Put the components into a 2x2 matrix

    var m = [[a, b], [c, d]]

    // Compute X scale factor and normalize first row.

    var scale = [length(m[0])]
    m[0] = normalize(m[0])

    // Compute shear factor and make 2nd row orthogonal to 1st.

    var skew = dot(m[0], m[1])
    m[1] = combine(m[1], m[0], 1, -skew)

    // Now, compute Y scale and normalize 2nd row.

    scale[1] = length(m[1])
    // m[1] = normalize(m[1]) //
    skew /= scale[1]

    // Now, get the rotation out

    var rotate = atan2(m[0][1], m[0][0])

    return [translate, rotate, skew, scale]

}
