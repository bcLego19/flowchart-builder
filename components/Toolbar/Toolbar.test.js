import React from "react";
import { shallow } from "enzyme";
import Toolbar from "./Toolbar";

describe("Toolbar", () => {
  test("matches snapshot", () => {
    const wrapper = shallow(<Toolbar />);
    expect(wrapper).toMatchSnapshot();
  });
});
