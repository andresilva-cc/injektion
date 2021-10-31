import DependencyType from './DependencyType';

interface Dependency {
  type: DependencyType;
  reference: typeof Function;
  instructions?: () => any;
  instance?: any;
  resolved: boolean;
}

export default Dependency;
