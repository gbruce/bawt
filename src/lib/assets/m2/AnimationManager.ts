
import { SignalDispatcher } from 'strongly-typed-events';
import { AnimationMixer, AnimationClip, AnimationAction, KeyframeTrack, InterpolateLinear, Bone } from 'three';
import { IAnimationBlock, ITrackOptions, IAnimation } from 'blizzardry/lib/m2';

export class AnimationManager {
  private _onUpdate = new SignalDispatcher();
  private animationClips: AnimationClip[] = [];
  private sequenceClips: AnimationClip[] = [];
  private loadedAnimations: AnimationAction[] = [];
  private loadedSequences: AnimationAction[] = [];
  private mixer: AnimationMixer;
  private length: number;

  constructor(root: any, private animations: IAnimation[], private sequences: any[]) {
    this.mixer = new AnimationMixer(root);
    // M2 animations are keyframed in milliseconds.
    this.mixer.timeScale = 1000.0;

    animations.forEach((animation, index) => {
      this.animationClips[index] = new AnimationClip('animation-' + index, animation.length, []);
    });

    sequences.forEach((sequence, index) => {
      this.sequenceClips[index] = new AnimationClip('sequence-' + index, sequence, []);
    });

    this.length = this.animationClips.length + this.sequenceClips.length;
  }

  public get onUpdate() {
    return this._onUpdate.asEvent();
  }

  public update(delta: number): void {
    this.mixer.update(delta);
    this._onUpdate.dispatch();
  }

  public loadAnimation(index: number): AnimationAction {
    let action = this.loadedAnimations[index];
    if (!action) {
      const clip = this.animationClips[index];
      action = this.mixer.clipAction(clip);
      this.loadedAnimations[index] = action;
    }
    return action;
  }

  public unloadAnimation(index: number): void {
    const animation = this.loadedAnimations[index];
    if (animation) {
      const clip = this.animationClips[index];
      this.mixer.uncacheClip(clip);
      delete this.loadedAnimations[index];
    }
  }

  public playAnimation(index: number): void {
    this.loadAnimation(index).play();
  }

  public stopAnimation(index: number): void {
    const action = this.loadedAnimations[index];
    if (action) {
      action.stop();
    }
  }

  public loadSequence(index: number): AnimationAction {
    let action = this.loadedSequences[index];
    if (!action) {
      const clip = this.sequenceClips[index];
      action = this.mixer.clipAction(clip);
      this.loadedSequences[index] = action;
    }
    return action;
  }

  public unloadSequence(index: number): void {
    const action = this.loadedSequences[index];
    if (action) {
      const clip = this.sequenceClips[index];
      this.mixer.uncacheClip(clip);
      delete this.loadedSequences[index];
    }
  }

  public playSequence(index: number): void {
    this.loadSequence(index).play();
  }

  public playAllSequences(): void {
    this.sequences.forEach((sequence, index) => {
      this.playSequence(index);
    });
  }

  public stopSequence(index: number): void {
    const action = this.loadedSequences[index];
    if (action) {
      action.stop();
    }
  }

  public unregisterTrack(id: string) {
    this.animationClips.forEach((clip) => {
      clip.tracks = clip.tracks.filter((track) => {
        return track.name !== id;
      });

      clip.trim();
      clip.optimize();
    });

    this.sequenceClips.forEach((clip) => {
      clip.tracks = clip.tracks.filter((track) => {
        return track.name !== id;
      });

      clip.trim();
      clip.optimize();
    });
  }

  public registerTrack(opts: ITrackOptions): string {
    let id: string;
   
    if (opts.animationBlock.globalSequenceID > -1) {
      id = this.registerSequenceTrack(opts);
    }
    else {
      id = this.registerAnimationTrack(opts);
    }

    return id;
  }

  private registerAnimationTrack(opts: any): string {
    const trackName = opts.target.uuid + '.' + opts.property;
    const animationBlock = opts.animationBlock;
    const { valueTransform } = opts;

    animationBlock.tracks.forEach((trackDef: any, index: number) => {
      const animationDef = this.animations[index];

      // Avoid creating tracks for external .anim animations.
      if ((animationDef.flags & 0x130) === 0) {
        return;
      }

      // Avoid creating empty tracks.
      if (trackDef.timestamps.length === 0) {
        return;
      }

      const timestamps = trackDef.timestamps;
      const values: any[] = [];

      // Transform values before passing in to track.
      trackDef.values.forEach((rawValue: any) => {
        if (valueTransform) {
          values.push.apply(values, valueTransform(rawValue));
        }
        else {
          values.push.apply(values, rawValue);
        }
      });

      const clip = this.animationClips[index];
      // new THREE[opts.trackType](trackName, timestamps, values);
      const track: KeyframeTrack = new KeyframeTrack(trackName, timestamps, values, InterpolateLinear);

      clip.tracks.push(track);
      clip.optimize();
    });

    return trackName;
  }

  private registerSequenceTrack(opts: any): string {
    const trackName = opts.target.uuid + '.' + opts.property;
    const animationBlock = opts.animationBlock;
    const { valueTransform } = opts;

    animationBlock.tracks.forEach((trackDef: any) => {
      // Avoid creating empty tracks.
      if (trackDef.timestamps.length === 0) {
        return;
      }

      const timestamps = trackDef.timestamps;
      const values: any[] = [];

      // Transform values before passing in to track.
      trackDef.values.forEach((rawValue: any) => {
        if (valueTransform) {
          values.push.apply(values, valueTransform(rawValue));
        }
        else {
          values.push.apply(values, rawValue);
        }
      });

      //const track = new THREE[opts.trackType](trackName, timestamps, values);
      const track: KeyframeTrack = new KeyframeTrack(trackName, timestamps, values, InterpolateLinear);

      const clip = this.sequenceClips[animationBlock.globalSequenceID];
      clip.tracks.push(track);
      clip.optimize();
    });

    return trackName;
  }
}
